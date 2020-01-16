import { ErrorRequestHandler } from 'express';

import { HttpError } from './http-error';

export const defaultErrReqHandler: ErrorRequestHandler = (err, req, res, next) => {
    let status: number = 500;
    let msg: string = 'Internal server error';

    if (err instanceof Error) {
        if (typeof err.message === 'string') {
            msg = err.message;
        }

        if (err instanceof HttpError) {
            status = err.status;
        }
    }

    res.status(status).json({
        msg: msg,
    });
};
