document.addEventListener("DOMContentLoaded", function() {
  
  let timerElem  = null, // timer for hoverByElem
    timerPopup = null; // timer for hoverByPopup    

  let clickOutside = function() {
    document.onclick = function(event) {        
      if (event.target.className != "jirainfo") {
        plugin_jirainfo.hide();
        event.stopPropagation();      
      }
    };
  };  
  
  document.querySelectorAll(".jirainfo[data-key]").forEach(function (el) {
    plugin_jirainfo_popover.addEvent(el);
  });

  let plugin_jirainfo = (function() {        
    let self = {};

    self.init = function () {      
    /*  
      for (let i = 0; i < elem.length; i++) {
        (CONF.trigger === "hover") ? hoverByElem(elem[i]) : eventClick(elem[i]);
      }
      // only click
      (CONF.trigger === "click") ? clickOutside() : '';
    */  
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

  //plugin_jirainfo.init(); 
 
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
});

let plugin_jirainfo_popover = (function () {    
  
  const CONF = {
    trigger:   JSINFO['jirainfo']['trigger']   || "click",
    placement: JSINFO['jirainfo']['placement'] || "top",
    animation: JSINFO['jirainfo']['animation'] || "pop"
  };   

  let self = {};

  self.addEvent = function (el) {            
    // add event    
    if (CONF.trigger === "click") {
      el.onclick = function () {
        self.eventHandler(el);
      }
    } else if (CONF.trigger === "hover") {
      el.onmouseover = function () {
        self.eventHandler(el);
      }
    }
  };
  
  self.eventHandler = function (el) {
    // set a properties
    self.id  = el.hasAttribute("data-target") ? el.getAttribute("data-target") : self.getTargetVal(el);
    self.key = el.getAttribute("data-key");
    self.show(el);
  };

  self.getTargetVal = function (el) {
    (!el.hasAttribute("data-target")) ? el.setAttribute("data-target", self.getTargetId()) : "";
    return el.getAttribute("data-target");    
  };

  self.getTargetId = (function () {
		let i = 0;
		return function () { return "jiPopup" + ++i; }
	}());
     
  /**
   * Create HTML-element the popover
   * @return {HTMLElement} 
   */
  self.createPopover = function() {
    const popup = document.createElement("div");
    popup.className = "ji-popup " + CONF.animation;
    popup.id = self.id;

    popup.appendChild(self.setArrowElement());
    popup.appendChild(self.setPopContent());
    document.body.appendChild(popup);

    return popup;
  };  
/**
 * Show the Popup-element
 * @param  {HTMLElement} elem reference element   
 */
  self.show = function (el) {
    const popup = document.querySelector("#"+self.id) || self.createPopover();
    self.addPopperJS(el);

    popup.style.display = "block";
    setTimeout(function () {
      popup.classList.remove(CONF.animation + "-out");
      popup.classList.add(CONF.animation + "-in");
    }, 50);
  };

  /**
   * Add control position element by Popper.js   
   * @param  {HTMLElement} elem reference link   
   */
  self.addPopperJS = function (elem) {
    let self = this;

    self.popper = new Popper(elem, self.getPopElemByName(), {
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
   * Create the content in the Popup-element
  
   * @param  {string} content - icon-load
   * @return {Element} 
   */
  self.setPopContent = function(content) {
    const popContent = document.createElement("div");    
    
    popContent.className = "ji-popup-content";
    popContent.innerHTML = content || '<div class="icon-load"></div>';
    return popContent;
  };
  /**
   * Create arrow in the Popup-element
  
   * @param  {string} content icon-load
   * @return {Element} 
   */  
  self.setArrowElement = function() {
    const arrow = document.createElement("div");
    arrow.className = "ji-arrow arrow-"+ CONF.placement;  
    return arrow;
  };  
  /**
   * Set position arrow-element 
  
   * @param  {String} place placement arrow-element
   */
  self.setArrowPlacement = function(place) {                
    self.getPopElemByName("arrow").className = "ji-arrow arrow-" + place;
  };   
  /**
   * Returns elements Popup by their a name 
  
   * @param  {string} name arrow, content, body, and by default(null) Popup
   * @return {Element}
   */
  self.getPopElemByName = function (name) {
    const popup = document.getElementById(self.id);
    
    switch (name) {
      case "arrow": 
        return popup.children[0];                    
        break;

      case "content": 
        return popup.children[1];                    
        break;

      case "body":
        return popup.children[1].children[0];                    
        break;

      default:
        return popup;
        break;
    }
  };
  /**
   * Ajax request    
   */
  self.getDataByKey = function () {
    let self = this;
    jQuery.post(
      DOKU_BASE + "lib/exe/ajax.php",
      {
        call: "plugin_jirainfo",
        key: this.key
      },
      function (data) { self.fillPopBody(JSON.parse(data)); }
    );
  };

  self.fillPopBody = function (obj) {
    // task not found or does not exist     
    if (obj.errors) {
      self.updContent(obj.errors);
      return;
    }

    let html = '<div class="ji-popup-content-body">';
    //title(summary)
    html += obj.summary ? '<p class="ji-summary">' + obj.summary + "</p>" : "";
    //status
    html += obj.status ? '<div class="ji-status"><span class="color-' + obj.status.color + '">'
      + obj.status.name + "</span></div>" : "";
    //issuetype
    html += obj.issuetype ? '<img src="' + obj.issuetype.iconUrl + '" class="ji-issuetype" title="' + 
      obj.issuetype.name + '">' : "";
    //priority
    html += obj.priority ? '<img src="' + obj.priority.iconUrl + '" class="ji-issuetype" title="' + 
    obj.priority.name + '">' : "";
    //comment
    html += obj.totalComments ? '<div class="ji-comment-circle"><span class="total-comments">' +
      obj.totalComments + "</span></div>" : "";
    // url task
    html += obj.issueUrl ? '<a href="' + obj.issueUrl + '"class="ji-key-link">' + obj.key + "</a>" : "";
    html += '</div>';

    self.updContent(html);
  };

  self.updContent = function (html) {
    self.getPopElemByName('content').innerHTML = html;    
    // initialization a method onUpdate in popper.js
    self.popper.scheduleUpdate();     
  };
  return self;
})();