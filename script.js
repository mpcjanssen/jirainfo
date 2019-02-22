document.addEventListener("DOMContentLoaded", function() {
  
  var elem = document.querySelectorAll(".jirainfo"),        
    //Counter new popup elements  
    counter = (function () {
      var i = 0; return function () { return ++i; }
    }()),
    timerElem  = null, // timer for hoverByElem
    timerPopup = null; // timer for hoverByPopup    

  const CONF = {
    trigger:   JSINFO['jirainfo']['trigger']   || "click",
    placement: JSINFO['jirainfo']['placement'] || "top",
    animation: JSINFO['jirainfo']['animation'] || "pop"
  };      

  var  clickOutside = function() {
    document.onclick = function(event) {        
      if (event.target.className != "jirainfo") {
        plugin_jirainfo.hide();
        event.stopPropagation();      
      }
    };
  };
  //
  // ACTIONS
  //
  var plugin_jirainfo = (function() {        
    var self  = {};
  
    self.init = function () {      
      for (let i = 0; i < elem.length; i++) {
        (CONF.trigger === "hover") ? hoverByElem(elem[i]) : eventClick(elem[i]);
      }    
      // only click
      (CONF.trigger === "click") ? clickOutside() : '';
    };

    self.open = function () {  
      if (self.isOpened(this)) return;
      // to hide all opened popup
      self.hide();

      var popup = new jiPopup(this);       
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
     * Hide all opened popup elements
     */    
    self.hide = function () {             
      let popupItems = document.querySelectorAll(".ji-popup."+ CONF.animation +"-in");
      //doesn't not found
      if (!popupItems) return;

      for(let i = 0; i < popupItems.length; i++) {
        self.setDisplayNone(popupItems[i]);
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
        timerPopup = setTimeout(hoverByPopup.call(elem), 100); 
      }
    };    
  };
  
  /**
   * @function
   * Trigger Hover
   * Events by popup element   
   */
  function hoverByPopup() {
    var popup = document.getElementById(this.getAttribute("data-target")),
      timer = setTimeout(plugin_jirainfo.hide, 100);   

    popup.onmouseover = function () {      
      clearTimeout(timerPopup); // on open popup
      clearTimeout(timerElem);  // if return out for refer element
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
      return func.call(context);
    };
  };  

  /**
   * @Class jiPopup
   * @constructor
   * @param  {} elem target element
  */
  function jiPopup(elem) {                 

    if (this.isCreated(elem)) {
      this.id  = elem.getAttribute("data-target");      
    } else {                        
      this.id = "jiPopup" + counter();
      elem.setAttribute("data-target", this.id);
    }
    this.key = elem.getAttribute("data-key");       
  }; 
  /**
   * Create the Popup-element with arrow and content
   */
  jiPopup.prototype.create = function() {        
    if (this.getPopElemByName()) return;

      const popup = document.createElement("div");
      popup.className = "ji-popup "+ CONF.animation +" "+ CONF.animation +"-out";      
      popup.id = this.id;
      popup.appendChild(this.setArrowElement());
      popup.appendChild(this.setPopContent());      
      document.body.appendChild(popup);      
  };  
  /**
   * Show the Popup-element
   * @param  {HTMLElement} elem reference element   
   */
  jiPopup.prototype.show = function (elem) {
    const popup = this.getPopElemByName();
    this.createPopperJS(elem);

    popup.style.display = "block";
    setTimeout(function () {
      popup.classList.remove(CONF.animation + "-out");
      popup.classList.add(CONF.animation + "-in");
    }, 50);
  };
  
  /**
   * Add controll position element by Popper.js   
   * @param  {HTMLElement} elem reference link   
   */
  jiPopup.prototype.createPopperJS = function (elem) {
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
  jiPopup.prototype.isCreated = function(elem) {
    return elem.hasAttribute("data-target");
  };
       
  /**
   * Create the content in the Popup-element
   * @method
   * @param  {string} content - icon-load
   * @return {Element} 
   */
  jiPopup.prototype.setPopContent = function(content) {
    const popContent = document.createElement("div");    
    
    popContent.className = "ji-popup-content";
    popContent.innerHTML = content || '<div class="icon-load"></div>';
    return popContent;
  };
  /**
   * Create arrow in the Popup-element
   * @method
   * @param  {string} content icon-load
   * @return {Element} 
   */  
  jiPopup.prototype.setArrowElement = function() {
    const arrow = document.createElement("div");
    arrow.className = "ji-arrow arrow-"+ CONF.placement;  
    return arrow;
  };  
  /**
   * Set position arrow-element 
   * @method
   * @param  {String} place placement arrow-element
   */
  jiPopup.prototype.setArrowPlacement = function(place) {                
    this.getPopElemByName("arrow").className = "ji-arrow arrow-" + place;
  };   
  /**
   * Returns elements Popup by their a name 
   * @method
   * @param  {string} name arrow, content, body, and by default(null) Popup
   * @return {Element}
   */
  jiPopup.prototype.getPopElemByName = function(name) {
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
  jiPopup.prototype.getDataByKey = function() {
    let self = this;
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

  jiPopup.prototype.fillPopBody = function(obj) {
    // task not found or does not exist     
    if (obj.errors) {
      this.updContent(obj.errors);
      return;
    }
    let html = '<div class="ji-popup-content-body">';
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

  jiPopup.prototype.updContent = function(html) {
    this.getPopElemByName('content').innerHTML = html;    
    // initialization a method onUpdate in popper.js
    this.popper.scheduleUpdate();     
  };  
});