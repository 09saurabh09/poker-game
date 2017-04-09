let Bull = require("bull");
let util = require('util');
function Queue(name, db, opts) {
    if (!(this instanceof Queue)) {
        return new Queue(name, db, opts);
    }
    db = db || DB_CREDENTIALS.REDIS_URL;
    opts = opts || GlobalConstant.bullQueueRedisConnectionOptions;
    Bull.call(this, name, db, opts);
}

util.inherits(Queue, Bull);

Queue.prototype.removeJob = function (jobId) {
    let self = this;
    return new PROMISE(function (resolve) {
        self.getJob(jobId).then(function (job) {
            if (job) {
                job.remove().then(function () {
                    console.log(`INFO ::: successfully removed job with id: ${job.jobId}`);
                    resolve();
                })
            } else {
                resolve();
            }
        })
    })
}

module.exports = Queue;