.import "databaseHeader.js" as DBC

function removeTaskFromToday(taskId)//return 1 means Query is successfuly executed, etc means error.
//this function is copied from completedTasks.js
{
    try
    {
        var result=0;
        var db = DBC.getDatabase();
        db.transaction
                (
                    function(tx)
                    {
                        var rs = tx.executeSql('DELETE FROM '+DBC.table_todayTasks+' WHERE t_id=?;',[taskId]);
                        if (rs.rowsAffected > 0)
                        {
                            console.log("source : todayTask.js/removeTaskFromToday() -> query successfully exectured.");
                            result= 1;
                        }
                        else
                        {
                            console.log("source : todayTask.js/removeTaskFromToday() -> query failed.");
                            result= 0;
                        }

                    }
                );
        return result;
    }
    catch(error)
    {
        console.log("source : todayTask.js/removeTaskFromToday() -> error= "+error);
        return "source : todayTask.js/removeTaskFromToday() -> error= "+error;
    }
}

function addTaskToToday(taskId) //return 1 means Query is OK, etc is failure
{
    try
    {
        var db = DBC.getDatabase();
        var result = 0;
        db.transaction
                (
                    function(tx)
                    {
                        var rs = tx.executeSql('INSERT INTO '+DBC.table_todayTasks+' (t_id) VALUES (?);',
                                                                             [taskId]);

                        if (rs.rowsAffected > 0)
                        {
                            console.log("source : todayTask.js/addTaskToToday() -> query successfully exectured.");
                            result = "1";
                        }
                        else
                        {
                            console.log("source : todayTask.js/addTaskToToday() -> query failed.");
                            result = "0";
                        }

                    }
                );
        return result;
    }
    catch(error)
    {
        console.log("source : todayTask.js/addTaskToToday() -> error= "+error);
        return "source : todayTask.js/addTaskToToday() -> error= "+error;
    }
}

function getList(targetList,returnType="json") //return ETC means OK, return 1 is error
{
    /*
      function copied from allTasks.js
        This function will fetch and return as json OR append data into the list.

        Argumants:
            targetList = that list we want to append data into
                    (optional).

            returnType = is a flag to know with wich format return, json or append to targetList
                    values = ['json',''] json or etc -> appendToList
                    (default: return as json)


        Output:
                Json:
                            tasks =>
                                    id,title,description,
                                    timeToPerform,deadline,creationDate,
                                    priority,childCount(*NOTE-1*),childX(*NOTE-2*)

                            (*NOTE-1*) childCount -> when json paresed you need to get this and make a loop untill this value to know how much child has.


                            (*NOTE-2*) childX -> X means a number, for exmaple our task has 10 step, so we read from childCount then looking for child1[i] to child10[i].
                                    to access childX values needs to do childX[y] y from 0 to 5
                                              for EXAMPLE:

                                              {
                                                "tasks":
                                                [
                                                    {
                                                      "id": "33",
                                                      "title": "something",
                                                      "description": "helloworld",
                                                      , ETC... ,
                                                      "child1":
                                                      [
                                                        "id",
                                                        10,
                                                        "title",
                                                        12,
                                                        "description",
                                                        "thi is the taskStep Description",
                                                        "completeDate",
                                                        "10-2-2000 10:22:14"
                                                      ]
                                                      "child2":
                                                      [
                                                        "id",
                                                        11,
                                                        "title",
                                                        13,
                                                        "description",
                                                        "write the code",
                                                        "completeDate",
                                                        "14-2-2000 10:11:11"
                                                      ]
                                                    }
                                                    {
                                                      "id": "44",
                                                      "title": "something2",
                                                      "description": "33 3 3 helloworld3",
                                                      , ETC... ,
                                                      "child1":
                                                      [
                                                        "id",
                                                        14,
                                                        "title",
                                                        12,
                                                        "description",
                                                        "thi is the taskStep Description",
                                                        "completeDate",
                                                        "10-2-2000 10:22:14"
                                                      ]
                                                      "child2":
                                                      [
                                                        "id",
                                                        1222,
                                                        "title",
                                                        13,
                                                        "description",
                                                        "write the code",
                                                        "completeDate",
                                                        "14-2-2000 10:11:11"
                                                      ]
                                                    }
                                                  ]
                                                }
    */


    try
    {
        var db = DBC.getDatabase();
        var result = "1";

        db.transaction
                (
                    function(tx)
                    {
                        //fetch todayTask ids
                        //then fetch task detials via that id
                        var rs = tx.executeSql('SELECT * FROM '+DBC.table_allTasks+' WHERE t_id IN (SELECT t_id FROM '+DBC.table_todayTasks+') ORDER BY t_creationDate ASC;');
                        var tableColumns = rs.rows.length;

                        if (rs.rows.length > 0)
                        {
                            if(returnType==="json")
                            {
                                result= '{ "tasks" : [';
                                //pepear the json with tasks data:
                                for(var x=0; x<tableColumns; x++)
                                {
                                    var stepCounter=0;
                                    const theTaskId = rs.rows.item(x).t_id;
                                    result +=
                                            //task details are:
                                            '{ "id":"'+ theTaskId +
                                            '", "title":"'+ rs.rows.item(x).t_title +
                                            '", "description":"'+ rs.rows.item(x).t_description +
                                            '", "timeToPerform":"'+ rs.rows.item(x).t_timeToPerform +
                                            '", "deadline":"'+ rs.rows.item(x).t_deadline +
                                            '", "creationDate":"'+ rs.rows.item(x).t_creationDate +
                                            '", "priority":"'+ rs.rows.item(x).t_priority+'"';


                                    //task steps:
                                    var res_taskSteps = tx.executeSql('SELECT * FROM '+DBC.table_taskSteps+' WHERE t_id = '+ theTaskId);
                                    var table_taskSteps_Columns = res_taskSteps.rows.length;
                                    if (table_taskSteps_Columns > 0)
                                    {
                                        for(var y=0; y<table_taskSteps_Columns; y++)
                                        {
                                            stepCounter++;
                                            result+='", "child'+stepCounter+'":" ['+res_taskSteps.rows.item(y).ts_id +
                                                    ','+res_taskSteps.rows.item(y).ts_title+
                                                    ','+res_taskSteps.rows.item(y).ts_description+
                                                    ','+res_taskSteps.rows.item(y).ts_completeDate+
                                                    '"]';
                                            if(y<table_taskSteps_Columns-1)
                                                result += ",";
                                        }
                                    }
                                    //end of task steps.
                                    result += '}';


                                    if(x<tableColumns-1)
                                        result += ",";
                                }
                                result += "]}";
//                                console.log("\nsource : todayTask.js/getList(json) -> json result values are =" + result+"\n");
                            }


                            else
                            {
//                                //append into the list.
//                                //will collect taskStep data and place into lists
//                                var taskStepId;//list
//                                var taskStepTitle;//list
//                                var taskStepDescription;//list
//                                var taskStepCompleteDate;//list
                                for(var k=0; k<tableColumns; k++)
                                {
                                    //append task detials and taskStep detials.
                                    targetList.append({
                                                          tId: rs.rows.item(k).t_id,
                                                          tTitle : rs.rows.item(k).t_title > 15 ? rs.rows.item(k).t_title.slice(0,12) + ".." :  rs.rows.item(k).t_title,
                                                          tDesc: rs.rows.item(k).t_description,
                                                          tTimerToPerForm: rs.rows.item(k).t_timeToPerform,
                                                          tDeadline: rs.rows.item(k).t_deadline,
                                                          tCreation: rs.rows.item(k).t_creationDate,
                                                          tPriority: rs.rows.item(k).t_priority,
                                                      });

//                                    //task steps:
//                                    var res_taskSteps1 = tx.executeSql('SELECT * FROM '+DBC.table_taskSteps+' WHERE t_id = '+ theTaskId);
//                                    var table_taskSteps_Columns1 = res_taskSteps1.rows.length;
//                                    if (table_taskSteps_Columns1 > 0)
//                                    {
//                                        for(var f=0; f<table_taskSteps_Columns1; f++)
//                                        {
//                                            taskStepId[f]=res_taskSteps1.rows.item(f).ts_id;
//                                            taskStepTitle[f]=res_taskSteps1.rows.item(f).ts_title;
//                                            taskStepDescription[f]=res_taskSteps1.rows.item(f).ts_description;
//                                            taskStepCompleteDate[f]=res_taskSteps1.rows.item(f).ts_completeDate;
//                                        }
//                                    }
                                }
//                                //end of task steps.

                                console.log("source : todayTask.js/getList(json) -> appended.");
                                return 0;
                            }

                        }

                        else
                        {
                            console.log("source : todayTask.js/getList(json) -> row data is less than 0.");
                        }

                    }
                    );
        return result;

    }
    catch(error)
    {
        console.log("source : todayTask.js/getList() -> error= "+error);
        return "source : todayTask.js/getList() -> error= "+error;
    }


}




