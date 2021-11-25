var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var node_1 = require("@sentry/node");
var tracing_1 = require("@sentry/tracing");
var utils_1 = require("@sentry/utils");
var domain = require("domain");
var parseRequest = node_1.Handlers.parseRequest;
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
exports.withSentry = function (origHandler) {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    return function (req, res) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
        var local, boundHandler;
        var _this = this;
        return tslib_1.__generator(this, function (_a) {
            // first order of business: monkeypatch `res.end()` so that it will wait for us to send events to sentry before it
            // fires (if we don't do this, the lambda will close too early and events will be either delayed or lost)
            // eslint-disable-next-line @typescript-eslint/unbound-method
            res.end = wrapEndMethod(res.end);
            local = domain.create();
            local.add(req);
            local.add(res);
            boundHandler = local.bind(function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                var currentScope, traceparentData, url, reqPath, _a, _b, _c, key, value, reqMethod, transaction, handlerResult, e_1, objectifiedErr;
                var e_2, _d;
                var _e;
                return tslib_1.__generator(this, function (_f) {
                    switch (_f.label) {
                        case 0:
                            currentScope = node_1.getCurrentHub().getScope();
                            if (currentScope) {
                                currentScope.addEventProcessor(function (event) { return parseRequest(event, req); });
                                if (tracing_1.hasTracingEnabled()) {
                                    traceparentData = void 0;
                                    if (req.headers && utils_1.isString(req.headers['sentry-trace'])) {
                                        traceparentData = tracing_1.extractTraceparentData(req.headers['sentry-trace']);
                                        utils_1.logger.log("[Tracing] Continuing trace " + ((_e = traceparentData) === null || _e === void 0 ? void 0 : _e.traceId) + ".");
                                    }
                                    url = "" + req.url;
                                    reqPath = utils_1.stripUrlQueryAndFragment(url);
                                    // Replace with placeholder
                                    if (req.query) {
                                        try {
                                            // TODO get this from next if possible, to avoid accidentally replacing non-dynamic parts of the path if
                                            // they match dynamic parts
                                            for (_a = tslib_1.__values(Object.entries(req.query)), _b = _a.next(); !_b.done; _b = _a.next()) {
                                                _c = tslib_1.__read(_b.value, 2), key = _c[0], value = _c[1];
                                                reqPath = reqPath.replace("" + value, "[" + key + "]");
                                            }
                                        }
                                        catch (e_2_1) { e_2 = { error: e_2_1 }; }
                                        finally {
                                            try {
                                                if (_b && !_b.done && (_d = _a.return)) _d.call(_a);
                                            }
                                            finally { if (e_2) throw e_2.error; }
                                        }
                                    }
                                    reqMethod = (req.method || 'GET').toUpperCase() + " ";
                                    transaction = node_1.startTransaction(tslib_1.__assign({ name: "" + reqMethod + reqPath, op: 'http.server' }, traceparentData), 
                                    // extra context passed to the `tracesSampler`
                                    { request: req });
                                    currentScope.setSpan(transaction);
                                    // save a link to the transaction on the response, so that even if there's an error (landing us outside of
                                    // the domain), we can still finish it (albeit possibly missing some scope data)
                                    res.__sentryTransaction = transaction;
                                }
                            }
                            _f.label = 1;
                        case 1:
                            _f.trys.push([1, 3, , 5]);
                            return [4 /*yield*/, origHandler(req, res)];
                        case 2:
                            handlerResult = _f.sent();
                            // Temporarily mark the response as finished, as a hack to get nextjs to not complain that we're coming back
                            // from the handler successfully without `res.end()` having completed its work.  This is necessary (and we know
                            // we can do it safely) for a few reasons:
                            //
                            // - Normally, `res.end()` is sync and completes before the request handler returns, as part of the handler
                            //   sending data back to the client. As soon as the handler is done, nextjs checks to make sure that the
                            //   response is indeed finished. (`res.end()` signals this by setting `res.finished` to `true`.) If it isn't,
                            //   nextjs complains. ("Warning: API resolved without sending a response for <url>.")
                            //
                            // - In order to prevent the lambda running the route handler from shutting down before we can send events to
                            //   Sentry, we monkeypatch `res.end()` so that we can call `flush()`, wait for it to finish, and only then
                            //   allow the response to be marked complete. This turns the normally-sync `res.end()` into an async function,
                            //   which isn't awaited because it's assumed to still be sync. As a result, nextjs runs the aforementioned
                            //   check before the now-async `res.end()` has had a chance to set `res.finished = false`, and therefore thinks
                            //   there's a problem when there's not.
                            //
                            // - In order to trick nextjs into not complaining, we can set `res.finished` to `true` before exiting the
                            //   handler. If we do that, though, `res.end()` gets mad because it thinks *it* should be the one to get to
                            //   mark the response complete. We therefore need to flip it back to `false` 1) after nextjs's check but 2)
                            //   before the original `res.end()` is called.
                            //
                            // - The second part is easy - we control when the original `res.end()` is called, so we can do the flipping
                            //   right beforehand and `res.end()` will be none the wiser.
                            //
                            // - The first part isn't as obvious. How do we know we won't end up with a race condition, such that the
                            //   flipping to `false` might happen before the check, negating the entire purpose of this hack? Fortunately,
                            //   before it's done, our async `res.end()` wrapper has to await a `setImmediate()` callback, guaranteeing its
                            //   run lasts at least until the next event loop. The check, on the other hand, happens synchronously,
                            //   immediately after the request handler (so in the same event loop). So as long as we wait to flip
                            //   `res.finished` back to `false` until after the `setImmediate` callback has run, we know we'll be safely in
                            //   the next event loop when we do so.
                            //
                            // And with that, everybody's happy: Nextjs doesn't complain about an unfinished response, `res.end()` doesn’t
                            // complain about an already-finished response, and we have time to make sure events are flushed to Sentry.
                            //
                            // One final note: It might seem like making `res.end()` an awaited async function would run the danger of
                            // having the lambda close before it's done its thing, meaning we *still* might not get events sent to Sentry.
                            // Fortunately, even though it's called `res.end()`, and even though it's normally sync, a) it's far from the
                            // end of the request process, so there's other stuff which needs to happen before the lambda can close in any
                            // case, and b) that other stuff isn't triggered until `res.end()` emits a `prefinished` event, so even though
                            // it's not technically awaited, it's still the case that the process can't go on until it's done.
                            //
                            // See
                            // https://github.com/vercel/next.js/blob/e1464ae5a5061ae83ad015018d4afe41f91978b6/packages/next/server/api-utils.ts#L106-L118
                            // and
                            // https://github.com/nodejs/node/blob/d8f1823d5fca5e3c00b19530fb15343fdd3c8bf5/lib/_http_outgoing.js#L833-L911.
                            res.finished = true;
                            return [2 /*return*/, handlerResult];
                        case 3:
                            e_1 = _f.sent();
                            objectifiedErr = utils_1.objectify(e_1);
                            if (currentScope) {
                                currentScope.addEventProcessor(function (event) {
                                    utils_1.addExceptionMechanism(event, {
                                        type: 'instrument',
                                        handled: true,
                                        data: {
                                            wrapped_handler: origHandler.name,
                                            function: 'withSentry',
                                        },
                                    });
                                    return event;
                                });
                                node_1.captureException(objectifiedErr);
                            }
                            // Because we're going to finish and send the transaction before passing the error onto nextjs, it won't yet
                            // have had a chance to set the status to 500, so unless we do it ourselves now, we'll incorrectly report that
                            // the transaction was error-free
                            res.statusCode = 500;
                            res.statusMessage = 'Internal Server Error';
                            // Make sure we have a chance to finish the transaction and flush events to Sentry before the handler errors
                            // out. (Apps which are deployed on Vercel run their API routes in lambdas, and those lambdas will shut down the
                            // moment they detect an error, so it's important to get this done before rethrowing the error. Apps not
                            // deployed serverlessly will run into this cleanup function again in `res.end(), but it'll just no-op.)
                            return [4 /*yield*/, finishSentryProcessing(res)];
                        case 4:
                            // Make sure we have a chance to finish the transaction and flush events to Sentry before the handler errors
                            // out. (Apps which are deployed on Vercel run their API routes in lambdas, and those lambdas will shut down the
                            // moment they detect an error, so it's important to get this done before rethrowing the error. Apps not
                            // deployed serverlessly will run into this cleanup function again in `res.end(), but it'll just no-op.)
                            _f.sent();
                            // We rethrow here so that nextjs can do with the error whatever it would normally do. (Sometimes "whatever it
                            // would normally do" is to allow the error to bubble up to the global handlers - another reason we need to mark
                            // the error as already having been captured.)
                            throw objectifiedErr;
                        case 5: return [2 /*return*/];
                    }
                });
            }); });
            // Since API route handlers are all async, nextjs always awaits the return value (meaning it's fine for us to return
            // a promise here rather than a real result, and it saves us the overhead of an `await` call.)
            return [2 /*return*/, boundHandler()];
        });
    }); };
};
/**
 * Wrap `res.end()` so that it closes the transaction and flushes events before letting the request finish.
 *
 * Note: This wraps a sync method with an async method. While in general that's not a great idea in terms of keeping
 * things in the right order, in this case it's safe', as explained in detail in the long comment in the main
 * `withSentry()` function.
 *
 * @param origEnd The original `res.end()` method
 * @returns The wrapped version
 */
function wrapEndMethod(origEnd) {
    return function newEnd() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, finishSentryProcessing(this)];
                    case 1:
                        _a.sent();
                        // If the request didn't error, we will have temporarily marked the response finished to avoid a nextjs warning
                        // message. (See long note above.) Now we need to flip `finished` back to `false` so that the real `res.end()`
                        // method doesn't throw `ERR_STREAM_WRITE_AFTER_END` (which it will if presented with an already-finished response).
                        this.finished = false;
                        return [2 /*return*/, origEnd.call.apply(origEnd, tslib_1.__spread([this], args))];
                }
            });
        });
    };
}
/**
 * Close the open transaction (if any) and flush events to Sentry.
 *
 * @param res The outgoing response for this request, on which the transaction is stored
 */
function finishSentryProcessing(res) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var transaction, transactionFinished, e_3;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    transaction = res.__sentryTransaction;
                    if (!transaction) return [3 /*break*/, 2];
                    transaction.setHttpStatus(res.statusCode);
                    transactionFinished = new Promise(function (resolve) {
                        setImmediate(function () {
                            transaction.finish();
                            resolve();
                        });
                    });
                    return [4 /*yield*/, transactionFinished];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    utils_1.logger.log('Flushing events...');
                    return [4 /*yield*/, node_1.flush(2000)];
                case 3:
                    _a.sent();
                    utils_1.logger.log('Done flushing events');
                    return [3 /*break*/, 5];
                case 4:
                    e_3 = _a.sent();
                    utils_1.logger.log("Error while flushing events:\n" + e_3);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
//# sourceMappingURL=withSentry.js.map