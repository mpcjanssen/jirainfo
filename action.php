<?php
/**
 * Jirainfo action plugin for DokuWiki
 *
 * @author     Vadim Balabin <vadikflint@gmail.com>
 * @license    GPL 2 (http://www.gnu.org/licenses/gpl.html)
 */
class action_plugin_jirainfo extends DokuWiki_Action_Plugin {

    function register(Doku_Event_Handler $controller) {
        $controller->register_hook('AJAX_CALL_UNKNOWN', 'BEFORE', $this,'_ajax_call');
        $controller->register_hook('TPL_METAHEADER_OUTPUT', 'BEFORE', $this, '_hookjs');
        $controller->register_hook('DOKUWIKI_STARTED', 'AFTER', $this, '_fillConf');
    }
    
    /**
     * handle ajax requests
     */
    public function _ajax_call(Doku_Event $event, $param) 
    {
        if ($event->data !== 'plugin_jirainfo') {
            return;
        }
        //no other ajax call handlers needed
        $event->stopPropagation();
        $event->preventDefault();
    
        //json library of DokuWiki
        //$json = new JSON();                             
        //set content type
        //header('Content-Type: application/json');        
        //echo json_encode($info); 
        //echo $this->html();
        echo json_encode($this->html());        
    }

    public function execRequest($key)
    {
        //$url = 'http://user:pass@url-api/rest/api/latest/issue/key';
        $auth = '?os_username='. $this->getConf('apiUser'). '&os_password='. $this->getConf('apiPass');
        $url = $this->getConf('apiUrl').'issue/'. $key . $auth;

        $http = new DokuHTTPClient();
        return $http->get($url);        
    }

    /**
     * html - parse result ajax-request
     *
     * @return html
     */
    public function html()    
    {
        $data = $this->execRequest(trim($_POST['key']));
        $arr = json_decode($data, true);

        if (!$arr) return 'ЗАПРОС НЕ СУЩЕСТВУЕТ';

        $taskInfo = [    
                'key'      => $arr['key'],                 
                'status'  => [
                                'name'  => $arr['fields']['status']['name'],
                                'color' => $arr['fields']['status']['statusCategory']['colorName'],
                              ],
                'issueUrl' => $this->getTaskUrl($taskInfo['key']),
                'summary'   => $arr['fields']['summary'],
                'priority' => [
                                'name'    => $arr['fields']['priority']['name'],
                                'iconUrl' => $arr['fields']['priority']['iconUrl'],
                              ],
                'issuetype'=> [
                                'name'    => $arr['fields']['issuetype']['name'],
                                'iconUrl' => $arr['fields']['issuetype']['iconUrl']
                              ],
                'totalComments' => $arr['fields']['comment']['total']               
                ];
        /*              
        $html  = '<p class="summary">'. $taskInfo['summary'] .'</p>';
        $html .= sprintf('<div class="status"><span class="color-%s">%s</span></div>',
                          $taskInfo['status']['color'],
                          $taskInfo['status']['name']);
        $html .= sprintf('<img src="%s" class="issuetype" title="%s">', 
                          $taskInfo['issuetype']['iconUrl'],
                          $taskInfo['issuetype']['name']);         
        $html .= sprintf('<img src="%s" class="priority" title="%s">', 
                          $taskInfo['priority']['iconUrl'],
                          $taskInfo['priority']['name']);
        $html .= ($taskInfo['totalComments']) ? '<div class="comment-circle"><span class="total_comments">'. $taskInfo['totalComments'] .'</span></div>' : '';
        $html .= '<a href="'. $this->getTaskUrl($taskInfo['key']) .'"class="key_link">'. $taskInfo['key'] .'</a>';       
        */
        //return $html;
        return $taskInfo;
    }

    public function getTaskUrl(String $key = null)
    {
        $arrURL = parse_url($this->getConf('apiUrl'));
        return $arrURL['scheme'] .'://'. $arrURL['host'] .'/browse/'. $key;
        
    }
    public function _hookjs(Doku_Event $event, $param) 
    {      
        $event->data['script'][] = array(
                        'type'    => 'text/javascript',
                        'charset' => 'utf-8',
                        '_data'   => '',
                        'src'     => DOKU_BASE."lib/plugins/jirainfo/src/popper.min.js");
    }

    public function _fillConf()
    {
        global $JSINFO;

        $JSINFO['jirainfo'] = [
            'trigger'   => $this->getConf('popoverTrigger'),
            'animation' => $this->getConf('popoverAnimation'),
            //'width'     => $this->getConf('popoverWidth'),
            //'height'    => $this->getConf('popoverHeigth'),
            'offsetTop' => $this->getConf('popoverOffsetTop'),
            'offsetLeft' => $this->getConf('popoverOffsetLeft'),
        ];

    }
}