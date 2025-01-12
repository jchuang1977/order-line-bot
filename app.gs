//認證身份 channel_access_token
var CHANNEL_ACCESS_TOKEN='338nO8hVm6Alyyrn72gud7xGzsBljI2C14HihcQHJOTfD2r0GljYCYL2hVR5ONBspnEa7HVxdJIy7AKF+iF3BJbFHe/rBoYhVkvFbwZS/sQiXCWowvFoXJVLOEP/QSXbrvu3380LpUSAau53q5pc9AdB04t89/1O/w1cDnyilFU=' //輸入自己 LINE BOT 的 channel_access_token



//主程式跑的地方(main)
function doPost(e)  {  //當網頁有Post請求時就會依據網址來執行這doPost
  var msg= JSON.parse(e.postData.contents); //將事件(e)內的文字訊息解析出來
  //msg內部存放著全部LINE事件產生的全部訊息
  

	/* 
	* LINE API JSON 解析資訊
	*
	* replyToken : 一次性回覆 token
	* user_id : 使用者 user id，查詢 username 用
	* userMessage : 使用者訊息，用於判斷是否為預約關鍵字
	* event_type : 訊息事件類型
	*/
	const replyToken = msg.events[0].replyToken;
	const user_id = msg.events[0].source.userId;
	const userMessage = msg.events[0].message.text;
	const event_type = msg.events[0].source.type; 
  
  var reply_msg = []; // 空白回覆訊息陣列，後期會加入 JSON

	// 這是對於訊息回覆的程式碼
	// https://api.line.me/v2/bot/message/reply 為官方公告的 reply api
	function reply_message(replyToken,reply,url='https://api.line.me/v2/bot/message/reply'){
	  UrlFetchApp.fetch(url, {
		  'headers': { //JavaScript的headers
			'Content-Type': 'application/json; charset=UTF-8',
			'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN, //帶入LINE BOT的channel_access_token
		  },
		  'method': 'post', //使用POST的方式回傳
		  'payload': JSON.stringify({ //將訊息轉為JSON格式，JavaScript常用JSON傳輸資料
			'replyToken': replyToken,  //每個reply事件專屬的replyToken
			'messages': [{'type': 'text','text':reply}] //回傳文字訊息，內容為reply也就是userMessage
			}),
		});
	} 


    // 將輸入值 word 轉為 LINE 文字訊息格式之 JSON
    function format_text_message(word) {
        let text_json = [{
            "type": "text",
            "text": word
        }]

        return text_json;
    }

    function send_to_line() {
        var url = 'https://api.line.me/v2/bot/message/reply';
        UrlFetchApp.fetch(url, {
            'headers': {
                'Content-Type': 'application/json; charset=UTF-8',
                'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN,
            },
            'method': 'post',
            'payload': JSON.stringify({
                'replyToken': replyToken,
                'messages': reply_msg,
            }),
        });
    }
  
  
      // 查詢傳訊者的 LINE 帳號名稱
    function get_user_name() {
        // 判斷為群組成員還是單一使用者
        switch (event_type) {
            case "user":
                var nameurl = "https://api.line.me/v2/bot/profile/" + user_id;
                break;
            case "group":
                var groupid = msg.events[0].source.groupId;
                var nameurl = "https://api.line.me/v2/bot/group/" + groupid + "/member/" + user_id;
                break;
        }

        try {
            //  呼叫 LINE User Info API，以 user ID 取得該帳號的使用者名稱
            var response = UrlFetchApp.fetch(nameurl, {
                "method": "GET",
                "headers": {
                    "Authorization": "Bearer " + CHANNEL_ACCESS_TOKEN,
                    "Content-Type": "application/json"
                },
            });
            var namedata = JSON.parse(response);
            var reserve_name = namedata.displayName;
        }
        catch {
            reserve_name = "not avaliable";
        }
        return String(reserve_name)
    }
  
  
	  var reserve_name = get_user_name();
  

    // for test
    //reply_message(replyToken,reserve_name); //使用reply_message這function來回覆訊息 // 不用這個
    
    //reply_msg = format_text_message(reserve_name);
    //send_to_line();

    /*
    * Google Sheet 資料表資訊設定
    *
    * 將 sheet_url 改成你的 Google sheet 網址
    * 將 sheet_name 改成你的工作表名稱
    */
    const sheet_url = 'https://docs.google.com/spreadsheets/d/1pDSezVNvHjeMcVwEi2nJzA0mQPYUyfA6S-Iw4euVxhw';
    const sheet_name = 'linebot';

    const SpreadSheet = SpreadsheetApp.openById('1pDSezVNvHjeMcVwEi2nJzA0mQPYUyfA6S-Iw4euVxhw');
    const reserve_list = SpreadSheet.getSheetByName(sheet_name);

    var current_list_row = reserve_list.getLastRow(); // 取得工作表最後一欄（ 直欄數 ）  

    //reply_msg = format_text_message("current_list_row" + current_list_row);
    //send_to_line();

    //檢查是否已有加1
    //let all_members = reserve_list.getRange(1, 1, current_list_row+1, 1).getValues().flat();
    let all_members = reserve_list.getRange('A1').getValues().flat();
    let leaving_member_index = all_members.indexOf(reserve_name);  // 這裡回傳從0開始??

    if (leaving_member_index != -1) {


    //reply_msg = format_text_message("leaving_member_index is " + leaving_member_index);
    //send_to_line();

      reserve_list.getRange(leaving_member_index +1, 1).setValue(reserve_name);
      reserve_list.getRange(leaving_member_index +1, 2).setValue(userMessage);

    }
    else {
      // 沒有記錄, 加在最後一行
      
      reserve_list.getRange(current_list_row + 1, 1).setValue(reserve_name);
      reserve_list.getRange(current_list_row + 1, 2).setValue(userMessage);
      //current_list_row = reserve_list.getLastRow();
    }



	   reply_msg = format_text_message(reserve_name + "已登記" +  userMessage);
     send_to_line();
	
}

