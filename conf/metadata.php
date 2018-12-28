<?php
/**
 * Options for the jirainfo plugin
 *
 */

$meta['apiUser'] = array('string'); 	     
$meta['apiPass'] = array('password');		 
$meta['apiUrl']  = array('string'); 
$meta['popoverTrigger']  = array('multichoice', '_choices' => array('hover', 'click'));
$meta['popoverAnimation']  = array('multichoice', '_choices' => array('none', 'pop', 'fade'));
$meta['popoverOffsetTop']  = array('numeric');
$meta['popoverOffsetLeft'] = array('numeric');
$meta['popoverWidth']  = array('numeric');
$meta['popoverHeight'] = array('numeric');