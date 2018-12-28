jQuery('document').ready(function() {        
    
    jQuery('.jirainfo').webuiPopover({
        placement: 'right',
        type: 'async',
        //title: "JiraInfo",//jQuery(this).attr('data-key'),               
        url: DOKU_BASE + 'lib/exe/ajax.php',                  
        data: jQuery(this),              
        content: function(data) { 
            /*
            let html = '';           
            for (let key in data) {
                html += '<b>' + LANG['plugins']['jirainfo']['content_' + key] + '</b> : ' + data[key] + '<br>';
            }
            */
            return data; 
        },                   
        //width: JSINFO['jirainfo']['width'],
        //height: JSINFO['jirainfo']['height'],
        trigger: 'click', //JSINFO['jirainfo']['trigger'],
        animation:JSINFO['jirainfo']['animation'],
        offsetTop: 0,//JSINFO['jirainfo']['offsetTop'],
        offsetLeft:0 //JSINFO['jirainfo']['offsetLeft']
    });   

    jQuery('.jirainfo').click(
        function () {
            console.log(jQuery(this).offset());
            console.log('width: '+ jQuery(this).width() +' height: ' + jQuery(this).height());

        }
    )
/*
    function getData($obj) {            

       jQuery.post(
            DOKU_BASE + 'lib/exe/ajax.php',
            {
                call: 'plugin_jirainfo', 
                key: $obj.attr('data-key')
            },
            function(data) { 
                $keyInfo = data;
                //$obj.attr({'data-content': 'Some text' })//data.status.toString() });
            }
            //,'json'
        )
        .done(function() {
        })
        .always(function() {
            //$obj.webuiPopover('show');  
        });     
        return $keyInfo.status;
    }
*/    
});