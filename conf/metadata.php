<?php
/**
 * Options for the jirainfo plugin
 *
 */

$meta['apiUser'] = array('string'); 	     
$meta['apiPass'] = array('password');		 
$meta['apiUrl']  = array('string'); 
$meta['popoverPlacement']  = array('multichoice', '_choices' => array('top', 'right', 'bottom', 'left'));
$meta['popoverTrigger']  = array('multichoice', '_choices' => array('hover', 'click'));
$meta['popoverAnimation']  = array('multichoice', '_choices' => array('none', 'pop', 'fade'));
$meta['popoverWidth']  = array('numeric');
$meta['popoverHeight'] = array('numeric');