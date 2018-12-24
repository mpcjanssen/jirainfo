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
    }
    
    /**
     * handle ajax requests
     */
    public function _ajax_call(Doku_Event $event, $param) {
        if ($event->data !== 'plugin_jirainfo') {
            return;
        }
        //no other ajax call handlers needed
        $event->stopPropagation();
        $event->preventDefault();
    
        //data
        $data = $this->execRequest(trim($_POST['key']));
        $arr = json_decode($data, true);
        //json library of DokuWiki
        //$json = new JSON();                             
        $info = [
                 'key'      => $arr['key'], 
                 'status'   => $arr['fields']['status']['name'],
                 'summary'  => $arr['fields']['summary'],
                 'priority' => $arr['fields']['priority']['name'],
                 'issuetype'=> $arr['fields']['issuetype']['name']                 
                ];      
        //set content type
        header('Content-Type: application/json');        
        echo json_encode($info);        
    }

    public function execRequest($key)
    {
        //$url = 'http://user:pass@url-api/rest/api/latest/issue/key';
        $auth = '?os_username='. $this->getConf('apiUser'). '&os_password='. $this->getConf('apiPass');
        $url = $this->getConf('apiUrl').'issue/'. $key . $auth;

        $http = new DokuHTTPClient();
        return $http->get($url);        
    }

    public function _hookjs(Doku_Event $event, $param) 
    {
        $event->data['script'][] = array(
                            'type'    => 'text/javascript',
                            'charset' => 'utf-8',
                            '_data'   => '',
                            'src'     => DOKU_BASE."lib/plugins/jirainfo/src/jquery.webui-popover.js");
    }
}