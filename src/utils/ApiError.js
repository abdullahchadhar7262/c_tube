class apiError extends Error{
    constructor(
        statusCode,
        message="something went wrong",
        error=[],
        statck=""
    ){
        super(message)
        this.statusCode = statusCode
        this.error = error
        this.statusCode = statusCode
        this.data = null
        this.message=message
        this.statck=statck
        this.success=false

             if (stack) {
            this.stack = stack
        } else{
            Error.captureStackTrace(this, this.constructor)
        }

    }
}

export default apiError