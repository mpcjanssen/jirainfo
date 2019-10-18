<?php
/**
 * Jirainfo syntax plugin for DokuWiki
 *
 * @author     Vadim Balabin <vadikflint@gmail.com>
 * @license    GPL 2 (http://www.gnu.org/licenses/gpl.html)
 */

// must be run within Dokuwiki
if(!defined('DOKU_INC')) die();

/**
 * All DokuWiki plugins to extend the parser/rendering mechanism
 * need to inherit from this class
 */
class syntax_plugin_jirainfo extends DokuWiki_Syntax_Plugin 
{   
    public function getType() {	return 'substition'; }
    public function getSort() { return 361; }
    public function connectTo($mode) { $this->Lexer->addSpecialPattern('([A-Z]+-[0-9]+)', $mode, 'plugin_jirainfo'); }
    
    
    public function handle($match, $state, $pos, Doku_Handler $handler){
      return array($match);
    }

    public function render($mode, Doku_Renderer $renderer, $data) 
    {  
      error_log($data);
        // $data is what the function handle() return'ed.                
      if($mode == 'xhtml') {
        list($key) = $data;
        $renderer->doc .= sprintf('<a class="jirainfo" href="javascript:void(0);" data-key="%s">%s</a>', $key, $key);		
        return true;
      }
      return false;
    }
}		
