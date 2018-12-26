jQuery('document').ready(function() {        
    
    const $jiConf = JSINFO['jirainfo']; 
    let $keyLink = jQuery('.jirainfo');

    // Trigger - hover or click
    switch ($jiConf['trigger']) {
        case 'hover':
            $keyLink.hover(        
                function() {
                    let test = new Popover(jQuery(this));
                    test.createPop();
                },          
                function() {
                    let test = new Popover(jQuery(this));
                    test.destroyPop();
                }   
            );                
            break;
    
        case 'click':
            $keyLink.click(function() {
                let test = new Popover(jQuery(this));
                test.createPop();
            });                
            break;
    };

class Popover {    
    constructor(obj) {                    
        this.target   = obj.attr('data-key');
        this.position = obj.offset();
    }
    init() {        
        console.log(this);
    }    
    getTarget() {        
        return this.target;
    }
    getPosition() {
        return this.position;        
    }
    setPostion() {        
        return this.position.left + 50;
    }
    hasPop() {
        let id = "#"+ this.target;
       return jQuery(id).length;    
    }    
    getAnimation() {
        switch ($jiConf['animation']) {
            case 'pop':                
                return 'pop in out';
                break;

            case 'fade':                
                
                break;
            default:
                break;
        } 
    }
    show(obj) {
        obj.addClass('in')
        .removeClass('out');
    }
    createPop() {        
        // if not have object
        if (!this.hasPop()) {
            /*
            var html = '<div id="'+ this.getTarget() +'" class="popover pop out">TEST' +
                       '<div class="webui-arrow"></div>' +
                       '<div class="webui-popover-inner">' +
                       '<a href="#" class="close"></a>' +
                       '<h3 class="webui-popover-title"></h3>' +
                       '<div class="webui-popover-content">TEST<i class="icon-refresh"></i> <p>&nbsp;</p></div>' +
                       '</div>' +
                       '</div>';
            */           
           var html = '<div id="'+ this.getTarget() +'"  class="ji-popover">'+
                      '<h3 class="ui-popover-title">Title</h3>'+
                      '</div>';
            jQuery('body').append(html);
            this.show(jQuery('#'+this.getTarget()));
        } else {
            this.show(jQuery('#'+this.getTarget()));            
        }
    }
    destroyPop() {
        jQuery('#'+this.getTarget())
        .removeClass('in')
        .addClass('out')
        //.detach();
    }
    getData() {

    }
}
 
/*
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
        trigger: 'hover',
        animation:'pop'
    });     

*/

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