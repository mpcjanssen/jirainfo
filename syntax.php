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
	public function connectTo($mode) { $this->Lexer->addEntryPattern('<(?:ji|jirainfo).*?>(?=.*?</(?:ji|jirainfo)>)', $mode, 'plugin_jirainfo'); }
    public function postConnect() { $this->Lexer->addExitPattern('</(?:ji|jirainfo)>','plugin_jirainfo'); }
    
    
    public function handle($match, $state, $pos, Doku_Handler $handler){
        switch ($state) {
			
          case DOKU_LEXER_ENTER :
            $xml = simplexml_load_string(str_replace('>', '/>', $match));
            //$tag = $xml->getName();
			
			foreach ($xml->attributes() as $key => $value) {
				$attributes[$key] = (string) $value;
			}

            if ($this->check($attributes)) return array($state, $attributes['key']);            
          break;
          	 
          case DOKU_LEXER_UNMATCHED :  return array($state, $match);
          case DOKU_LEXER_EXIT :       return array($state, '');
        }
        return array();
    }

    /**
     * check - correct attributes
     *
     * @param  Array $attributes
     *
     * @return boolean
     */
    public function check(array $attributes) 
    {
        return array_key_exists('key', $attributes);
    }

    public function render($mode, Doku_Renderer $renderer, $data) 
    {  
        // $data is what the function handle() return'ed.                
        if($mode == 'xhtml') {
            
            list($state, $match) = $data;
            switch ($state) {
                case DOKU_LEXER_ENTER:
                    list($state, $key) = $data;                    
                    $renderer->doc .= sprintf('<a class="jirainfo" href="javascript:void(0);" data-key="%s">', $key);		
                    break;			
                
                case DOKU_LEXER_UNMATCHED:
                    $renderer->doc .= htmlentities($match);  
                    break;

                case DOKU_LEXER_EXIT:
                    $renderer->doc .= '</a>';
                    break;
            }
        }
    }
}		