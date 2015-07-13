mui.plusReady(function(){
	console.log("here");
	loadInfo();
});


function loadInfo() {
    var uid = 1;
    var url = host + "/api/v1.0/recommend/";
    console.log(url);
    var data={"user_id":uid};
    ajax.post(url, data, function(rs) {
        cache('userinfo_' + uid, null); //清空缓存
        //endNetwork();
        
        console.log(JSON.stringify(rs.data));
        var html = template('item', rs);
        console.log(html);
        var table = document.body.querySelector('.mui-table-view');
        
       	table.innerHTML = html;
    });

    //检查等级
    //user.updateLV(function(rs) {
    //    console.log(JSON.stringify(rs))
    //});
};