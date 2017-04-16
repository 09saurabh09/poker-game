"use strict";

let UserModel = DB_MODELS.User;
let UserPokerTable = DB_MODELS.UserPokerTable;

module.exports = {
    addTableToUser: function (user, table) {
        UserModel.findOne({
            where: {
                id: user.id
            }
        }).then(function (user) {
            console.log(`SUCCESS ::: user ${user.id} has joined table ${table.id}`);
            return user.addPokerTables(table)

        }).catch(function (err) {
            console.log(`ERROR :::  user ${user.id} is unable to join table ${table.id}, error: ${err.message}, stack: ${err.stack}`);
        })

    },

    removeTableFromUser: function (user, table) {
        UserPokerTable.destroy({
            where: {
                PokerTableId: table.id,
                UserId: user.id
            }
        }).then(function (affectedRows) {
            console.log(`SUCCESS ::: user ${user.id} has left table ${table.id}`);
        }).catch(function (err) {
            console.log(`ERROR :::  user ${user.id} is unable to leave table ${table.id}, error: ${err.message}, stack: ${err.stack}`);
        })
    }
}