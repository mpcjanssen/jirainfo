<?php
/**
 * Jirainfo action plugin for DokuWiki
 *
 * @author     Vadim Balabin <vadikflint@gmail.com>
 * @license    GPL 2 (http://www.gnu.org/licenses/gpl.html)
 */
class action_plugin_jirainfo extends DokuWiki_Action_Plugin {

    protected $fields = ['status', 'priority', 'issuetype', 'comment']; // Default fields for viewing in popover    

    function register(Doku_Event_Handler $controller) {
        $controller->register_hook('AJAX_CALL_UNKNOWN', 'BEFORE', $this,'_ajax_call');
        $controller->register_hook('TPL_METAHEADER_OUTPUT', 'BEFORE', $this, '_hookjs');
        $controller->register_hook('DOKUWIKI_STARTED', 'AFTER', $this, 'setConf');
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
        echo json_encode($this->fillDataTask());                
    }
    
    /**
     * request - get data a task 
     *
     * @param string $key
     *
     * @return json
     */
    public function request(String $url)
    {   
        $http = new DokuHTTPClient();        
        return $http->get($url);                
    }

    public function getJiraApiUrl(String $key) 
    {
        $uri = parse_url($this->getConf('apiUrl')); 
        //Jira API URL endpoint must include the trailing slash        
        $path = (preg_match('/\w+\/$/', $uri['path'])) ? $uri['path'] : $uri['path'] . '/';      
        
        return sprintf('%s://%s:%s@%s/%s?fields=summary,%s',
            $uri['scheme'], 
            $this->getConf('apiUser'), 
            $this->getConf('apiPass'),
            $uri['host'].$path.'issue',
            $key,
            implode(",", $this->getFieldsRequest())
        );        
    } 

    /**
     * getFieldsRequest - returned fields for request
     *
     * @return array
     */
    public function getFieldsRequest() {
        $arrFields = explode(",", $this->getConf('taskHideField'));            
        return array_diff($this->fields, $arrFields);                 
    }

    /**
     * fillDataTask - to parse data about a task and returned in array
     *
     * @return Array
     */
    public function fillDataTask()    
    {   
        $res    = [];
        $task   = trim($_POST['key']);
        $fields = $this->getFieldsRequest(); 
        $url    = $this->getJiraApiUrl($task);
        $data   = $this->request($url);
        $arr    = json_decode($data, true); 

        // If task not found or does not exist
        if (!$arr) return ['errors' => sprintf($this->getlang('taskNotFound'), $task)];

        $res = [
            'key'      => $arr['key'],
            'summary'  => $arr['fields']['summary'],
            'issueUrl' => $this->getTaskUrl($task),
        ];

        if (in_array('status', $fields) && isset($arr['fields']['status'])) {
            $res['status'] = [
                'name'  => $arr['fields']['status']['name'],
                'color' => $arr['fields']['status']['statusCategory']['colorName']
            ];
        }
        if (in_array('priority', $fields) && isset($arr['fields']['priority'])) {
            $res['priority'] = [
                'name'    => $arr['fields']['priority']['name'],
                'iconUrl' => $arr['fields']['priority']['iconUrl']
            ];            
        }
        if (in_array('issuetype', $fields) && isset($arr['fields']['issuetype'])) {
            $res['issuetype'] = [
                'name'    => $arr['fields']['issuetype']['name'],
                'iconUrl' => $arr['fields']['issuetype']['iconUrl']
            ];
        }
        if (in_array('comment', $fields) && isset($arr['fields']['comment'])) {
            $res['totalComments'] = $arr['fields']['comment']['total'];
        }
        return $res; 
    }

    /**
     * getTaskUrl
     *
     * @param  String $key task key
     *
     * @return String
     */
    public function getTaskUrl (String $key = null)
    {
        $arrURL = parse_url($this->getConf('apiUrl'));
        return $arrURL['scheme'] .'://'. $arrURL['host'] .'/browse/'. $key;                
    }

    public function _hookjs(Doku_Event $event) 
    {
        $event->data['script'][] = array(
            'type'    => 'text/javascript',
            'charset' => 'utf-8',
            '_data'   => '',
            'src'     => DOKU_BASE."lib/plugins/jirainfo/src/popper.min.js");
    }

    /**
     * setConf - set config options in $JSINFO
     * 
     */
    public function setConf()
    {
        global $JSINFO;

        $JSINFO['jirainfo'] = [
            'placement' => $this->getConf('popoverPlacement'),
            'trigger'   => $this->getConf('popoverTrigger'),
            'animation' => $this->getConf('popoverAnimation')
        ];
    }
 }
