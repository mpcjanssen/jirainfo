<?php
/**
 * Options for the jirainfo plugin
 *
 */

$meta['apiUser'] = array('string'); 	     
$meta['apiPass'] = array('password');		 
$meta['apiUrl']  = array('string'); 
$meta['popoverPlacement'] = array('multichoice', '_choices' => array('top', 'right', 'bottom', 'left'));
$meta['popoverTrigger']   = array('multichoice', '_choices' => array('click', 'hover'));
$meta['popoverAnimation'] = array('multichoice', '_choices' => array('pop', 'fade'));