document.addEventListener("DOMContentLoaded", function() {
  
  var elem = document.querySelectorAll(".jirainfo"),
    i = 0, // counter of elements
    timerElem  = null, // timer for hoverByElem
    timerPopup = null; // timer for hoverByPopup    

  const CONF = {
    trigger:   JSINFO['jirainfo']['trigger']   || "click",
    placement: JSINFO['jirainfo']['placement'] || "top",
    animation: JSINFO['jirainfo']['animation'] || "fade"
  };      

  var plugin_jirainfo = (function() {        
    var self  = {};
  
    self.init = function () {      
      for (let i = 0; i < elem.length; i++) {
        (CONF.trigger === "hover") ? hoverByElem(elem[i]) : eventClick(elem[i]);      
      }    
    };
    self.open = function () {  
      if (self.isOpened(this)) return;
      // before hide opened popup 
      self.hide();

      var popup = new jiPopover(this);       
      popup.create();
      popup.show(this);      
      // if pop-element is created then only show, without getData
      if (popup.key) popup.getDataByKey();       
    };
    /**
     * Hide popup-element
     * @param  {HTMLElement} popup
     */
    self.setDisplayNone = function(popup) {
      setTimeout(function() { popup.style.display = "none"; }, 50);      
      popup.classList.remove(CONF.animation+"-in");
      popup.classList.add(CONF.animation+"-out");  
    };    
    /**     
     * @param  {String} this id popup-element
     */    
    self.hide = function () {             
      let popups = document.querySelectorAll(".ji-popover."+ CONF.animation +"-in");
      //doesn't not found
      if (!popups) return;

      for(let i = 0; i < popups.length; i++) {
        self.setDisplayNone(popups[i]);
      }
    };    
    self.isOpened = function (elem) {            
      if (elem.hasAttribute("data-target")) {        
        return document.getElementById(elem.getAttribute("data-target")).classList.contains(CONF.animation+"-in");
      }
    };
    return self;
  })();  

  plugin_jirainfo.init(); 
 
  /**
   * @function
   * Trigger Click
   * Events by popup element   
   */
  function eventClick(elem) {    
    elem.onclick = function() {
      plugin_jirainfo.open.call(elem);      
    }
  };
  // Hide poppers by click or mouseover element
  function hideByOutElem() {   
    document.onclick = function(event) {
      if (event.target.className != "jirainfo") {        
        event.stopPropagation();
      }
    }
  };
  
  /**
   * @function
   * Trigger Hover
   * Events by popup element   
   */
  function hoverByElem(elem) {
    var timer = null;      
    
    elem.onmouseover = function() {
      timer = setTimeout(bind(plugin_jirainfo.open, elem), 100);        
      clearTimeout(timerElem)
    };    
    elem.onmouseout = function () {
      clearTimeout(timer);                  
      if (plugin_jirainfo.isOpened(elem)) {             
        timerPopup = setTimeout(bind(hoverByPopup, elem), 100); 
      }
    };    
  };
  
  /**
   * @function
   * Trigger Hover
   * Events by popup element   
   */
  function hoverByPopup () {
    var popup = document.getElementById(this.getAttribute("data-target")),        
        timer = null;

    timer = setTimeout(plugin_jirainfo.hide, 100);      

    popup.onmouseover = function () {      
      clearTimeout(timerPopup); // returns on a popup
      clearTimeout(timerElem);  // out for refer element
      clearTimeout(timer);      // 
    };    
    popup.onmouseout = function () {             
      timerElem = setTimeout(plugin_jirainfo.hide, 100);            
    };
  };
  
  /**
   * @function
   * Bind function and this(context)
   * @param  {Function} func 
   * @param  {this} context
   * @return {this}    
   */
  function bind(func, context) {
    return function() {
      return func.apply(context);
    };
  };  

  /**
   * @Class jiPopover
   * @constructor
   * @param  {} elem target element
  */
  function jiPopover(elem) {            
  // text
    if (this.isPopCreated(elem)) {
      this.id  = elem.getAttribute("data-target");      
    } else {
      this.id = "jiPopover" + ++i;                    
      elem.setAttribute("data-target", this.id);
    }
    this.key = elem.getAttribute("data-key");       
  }; 
  /**
   * Create the popover-element with arrow and content
   */
  jiPopover.prototype.create = function() {        
    if (this.getPopElemByName()) return;

      let pop = document.createElement("div");
      pop.className = "ji-popover "+ CONF.animation +" "+ CONF.animation +"-out";      
      pop.id = this.id;
      pop.appendChild(this.setArrowElement());
      pop.appendChild(this.setPopContent());      
      document.body.appendChild(pop);      
  };
  /**
   * Show the popover-element
   * @param  {HTMLElement} elem target element   
   */
  jiPopover.prototype.show = function(elem) {           

    let pop  = this.getPopElemByName();             
    this.createPopperJS(elem);

    pop.style.display = "block";
    setTimeout(function () {
      pop.classList.remove(CONF.animation+"-out");
      pop.classList.add(CONF.animation+"-in");
    }, 50);
  };
  
  /**
   * Add controll position element by Popper.js   
   * @param  {HTMLElement} elem reference link   
   */
  jiPopover.prototype.createPopperJS = function (elem) {
    let self = this;

    this.popper = new Popper(elem, this.getPopElemByName(), {
      placement: CONF.placement,
      modifiers: {
        offset: { offset: "0, 10px" },
        arrow: {
          element: self.getPopElemByName("arrow")
        },
        computeStyle: { gpuAcceleration: false }
      },
      onCreate: function (data) {
        self.setArrowPlacement(data.placement);
      },
      onUpdate: function (data) {
        self.setArrowPlacement(data.placement);
        self.getPopElemByName("body").style.opacity = 1; // pop-content-body                         
      }
    });
  }; 
  /**
   * Check created popper by element later
   * @param  {HTMLElement} elem - reference element
   * @return {Boolean} 
   */
  jiPopover.prototype.isPopCreated = function(elem) {
    return elem.hasAttribute("data-target");
  };
       
  /**
   * Create the content in the popover-element
   * @method
   * @param  {string} content - icon-load
   * @return {Element} 
   */
  jiPopover.prototype.setPopContent = function(content = '') {
    let popContent = document.createElement("div");    
    
    popContent.className = "ji-popover-content";
    popContent.innerHTML = content || '<div class="icon-load"></div>'; //by default load-icon
    return popContent;
  };
  /**
   * Create arrow in the popover-element
   * @method
   * @param  {string} content icon-load
   * @return {Element} 
   */  
  jiPopover.prototype.setArrowElement = function() {
    let arrow = document.createElement("div");
    arrow.className = "ji-arrow arrow-"+ CONF.placement;  
    return arrow;
  };  
  /**
   * Set position arrow-element 
   * @method
   * @param  {String} place placement arrow-element
   */
  jiPopover.prototype.setArrowPlacement = function(place) {                
    this.getPopElemByName("arrow").className = "ji-arrow arrow-" + place;
  };   
  /**
   * Returns elements popover by their a name 
   * @method
   * @param  {string} name arrow, content, body, and by default(null) popover
   * @return {Element}
   */
  jiPopover.prototype.getPopElemByName = function(name = '') {
    switch (name) {
      case "arrow": 
        return document.getElementById(this.id).children[0];                    
        break;
      
      case "content": 
        return document.getElementById(this.id).children[1];                    
        break;

      case "body":
        return document.getElementById(this.id).children[1].children[0];                    
        break;
      
      default:
        return document.getElementById(this.id);
        break;
    }
  };
  /**
   * Ajax request    
   */
  jiPopover.prototype.getDataByKey = function() {
    var self = this;
    jQuery.post(
      DOKU_BASE + "lib/exe/ajax.php",
      {
        call: "plugin_jirainfo",
        key: this.key
      },
      function(data) { self.fillPopBody(JSON.parse(data)); }
      //,'json'
    );
  };

  jiPopover.prototype.fillPopBody = function(obj) {
    // task not found or does not exist     
    if (obj.errors) {
      this.updContent(obj.errors);
      return;
    }

    var html = '<div class="ji-popover-content-body">';
    html +=
      '<p class="ji-summary">'+ obj.summary +"</p>" +
      '<div class="ji-status"><span class="color-'+ obj.status.color +'">' + obj.status.name +"</span></div>" +
      '<img src="'+ obj.issuetype.iconUrl +'" class="ji-issuetype" title="'+ obj.issuetype.name +'">';
  
    html += obj.totalComments ? '<div class="ji-comment-circle"><span class="total-comments">'+ 
            obj.totalComments + "</span></div>" : "";
    html += '<a href="' + obj.issueUrl + '"class="ji-key-link">' + obj.key + "</a>";
    html += '</div>';

    this.updContent(html);
  };
  jiPopover.prototype.updContent = function(html) {
    this.getPopElemByName('content').innerHTML = html;    
    // initialization a method onUpdate in popper.js
    this.popper.scheduleUpdate();     
  };  
});