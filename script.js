jQuery('document').ready(function() {        
    //let $keyLink = jQuery('.jirainfo'),
        //$keyInfo = {};

    jQuery('.jirainfo').webuiPopover({
        type: 'async',
        title: jQuery(this).attr('data-key'),               
        url: DOKU_BASE + 'lib/exe/ajax.php',                  
        data: jQuery(this),              
        content: function(data) { 
        /*    
            let html  = "Статус: " + data.status + "<br>";
            html += "Title: " + data.summary;        
            return html; 
        */  

            let html = '';
            for (let key in data) {
                html += '<b>' + key + '</b> : ' + data[key] + '<br>';
            }
            return html; 
        },
        trigger: 'hover',
        animation:'pop'
    });     

    function fillContent($obj) {
        let html;
        for (let key in $obj) {
            html += $obj[key];
        }
        return html; 
    }
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