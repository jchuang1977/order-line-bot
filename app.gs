//認證身份 channel_access_token
var CHANNEL_ACCESS_TOKEN='338nO8hVm6Alyyrn72gud7xGzsBljI2C14HihcQHJOTfD2r0GljYCYL2hVR5ONBspnEa7HVxdJIy7AKF+iF3BJbFHe/rBoYhVkvFbwZS/sQiXCWowvFoXJVLOEP/QSXbrvu3380LpUSAau53q5pc9AdB04t89/1O/w1cDnyilFU=' //輸入自己 LINE BOT 的 channel_access_token


// 372065900308  cloud project id


//主程式跑的地方(main)
function doPost(e)  {  //當網頁有Post請求時就會依據網址來執行這doPost
  var msg= JSON.parse(e.postData.contents); //將事件(e)內的文字訊息解析出來
  //msg內部存放著全部LINE事件產生的全部訊息
  

   console.log("dddddd")

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
  
    /*
    * Google Sheet 資料表資訊設定
    *
    * 將 sheet_url 改成你的 Google sheet 網址
    * 將 sheet_name 改成你的工作表名稱
    */
   // const sheet_url = 'https://docs.google.com/spreadsheets/d/1pDSezVNvHjeMcVwEi2nJzA0mQPYUyfA6S-Iw4euVxhw';
   // const sheet_name = 'linebot';
   // const SpreadSheet = SpreadsheetApp.openByUrl(sheet_url);
   // const reserve_list = SpreadSheet.getSheetByName(sheet_name);
  
  
  
	//reply_message(replyToken,user_id); //使用reply_message這function來回覆訊息
	
	reply_message(replyToken,reserve_name); //使用reply_message這function來回覆訊息
}

