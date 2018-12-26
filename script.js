jQuery('document').ready(function() {        
    
    jQuery('.jirainfo').webuiPopover({
        type: 'async',
        //title: "JiraInfo",//jQuery(this).attr('data-key'),               
        url: DOKU_BASE + 'lib/exe/ajax.php',                  
        data: jQuery(this),              
        content: function(data) { 
            let html = '';
            for (let key in data) {
                html += '<b>' + LANG['plugins']['jirainfo']['content_' + key] + '</b> : ' + data[key] + '<br>';
            }
            return html; 
        },        
        trigger: JSINFO['jirainfo']['trigger'],
        animation:JSINFO['jirainfo']['animation']
    });   

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