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
        let key = `bull:${self.name}:${jobId}`;
        REDIS_CLIENT.del(key, function(err, response) {
            console.log(err, response);
            if(response == 1) {
                console.log(`INFO ::: successfully removed job with id: ${jobId}`);
            } else {
                console.log(`ERROR ::: Unable to remove job with id ${key} ${err && err.message}`);
            }
            resolve();
        });
        // self.getJob(jobId).then(function (job) {
        //     if (job) {
        //         job.remove().then(function () {
        //             console.log(`INFO ::: successfully removed job with id: ${job.jobId}`);
        //             resolve();
        //         })
        //     } else {
        //         resolve();
        //     }
        // })
    })
}

module.exports = Queue;