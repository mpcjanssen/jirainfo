let plugin_jirainfo_popover = (function () {    
  
  const CONF = {
    trigger:   JSINFO['jirainfo']['trigger']   || "click",
    placement: JSINFO['jirainfo']['placement'] || "top",
    animation: JSINFO['jirainfo']['animation'] || "pop"
  };   

  let self = {
    id:  "", // id popover-element - jiPopup1, jiPopup2, etc.
    key: ""  // task jira
  },
    timerOpen  = null, // timer for hover event
    timerClose = null; // timer for hover event   

  self.addEvent = function (el) {            
    // add event    
    if (CONF.trigger === "click") {
      el.onclick = function () {
        self.eventHandler(el);
      }
    } else if (CONF.trigger === "hover") {      
      el.onmouseover = function () {
				clearTimeout(timerClose);
				timerOpen = setTimeout(bind(self.eventHandler, el), 300);
			};
			el.onmouseout = function () {
				clearTimeout(timerOpen);
        timerClose = setTimeout(self.hide, 300);			                
        self.popupHover();
			};
    }
  };
  
  self.eventHandler = function (el) {
    // set a properties
    self.id  = el.hasAttribute("data-target") ? el.getAttribute("data-target") : self.getTargetVal(el);
    self.key = el.getAttribute("data-key");
    self.show(el);
  };

  self.popupHover = function () {
    const popup = self.getPopupElem();
    popup.onmouseover = function () {
      clearTimeout(timerClose);
    };
    popup.onmouseout = function () {
      timerClose = setTimeout(self.hide, 300);            
    };
  };

  self.getTargetVal = function (el) {
    (!el.hasAttribute("data-target")) ? el.setAttribute("data-target", self.getPopupId()) : "";
    return el.getAttribute("data-target");    
  };

  self.getPopupId = (function () {
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
    self.getDataByKey();
    return popup;
  };  
/**
 * Show the Popup-element
 * @param  {HTMLElement} elem reference element   
 */
  self.show = function (el) {
    if (el.classList.contains("ji-open")) return;
    
    self.hide();
    const popup = document.querySelector("#"+self.id) || self.createPopover();
    self.addPopperJS(el);

    popup.style.display = "block";
    setTimeout(function () {
      popup.classList.remove(CONF.animation + "-out");
      popup.classList.add(CONF.animation + "-in");
    }, 50);
    el.classList.add("ji-open");
  };

  self.hide = function () {		
		const popup = document.querySelector(`.ji-popup.${CONF.animation}-in`),
			elem = document.querySelector(`.jirainfo.ji-open`);
		if (!popup) return;		
		
		popup.className = "ji-popup " + CONF.animation +" "+ CONF.animation+"-out";
		elem.classList.remove("ji-open");
		setTimeout( function () { popup.style.display = "none"; }, 50);					
	};

  /**
   * Add control position element by Popper.js   
   * @param  {HTMLElement} elem reference link   
   */
  self.addPopperJS = function (elem) {
    let self = this;

    self.popper = new Popper(elem, self.getPopupElem(), {
      placement: CONF.placement,
      modifiers: {
        offset: { offset: "0, 10px" },
        arrow: {
          element: self.getPopupElem("arrow")
        },
        computeStyle: { gpuAcceleration: false }
      },
      onCreate: function (data) {
        self.setArrowPlacement(data.placement);
      },
      onUpdate: function (data) {
        self.setArrowPlacement(data.placement);
        self.getPopupElem("body").style.opacity = 1; // pop-content-body                         
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
    self.getPopupElem("arrow").className = "ji-arrow arrow-" + place;
  };   
  
  /**
   * Returns elements Popup by their a name   
   * @param  {string} name arrow, content, body, and by default(null) Popup
   * @return {Element}
   */
  self.getPopupElem = function (name) {
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
    jQuery.post(
      DOKU_BASE + "lib/exe/ajax.php",
      {
        call: "plugin_jirainfo",
        key: self.key
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

    let html = '';
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

    self.updContent(html);
  };

  self.updContent = function (html) {
    self.getPopupElem('content').innerHTML = html;    
    // initialization a method onUpdate in popper.js
    self.popper.scheduleUpdate();     
  };
  return self;
})();

document.addEventListener("DOMContentLoaded", function() {
  // Init
  document.querySelectorAll(".jirainfo[data-key]").forEach(function (el) {
    plugin_jirainfo_popover.addEvent(el);
  });
  // For event by click
  (JSINFO['jirainfo']['trigger'] === "click") ? clickOutside () : "";

  function clickOutside () {
    document.onclick = function(event) {        
      if (!event.target.classList.contains("jirainfo")) {        
        plugin_jirainfo_popover.hide();
        event.stopPropagation();      
      }
    };
  };    
});