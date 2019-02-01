window.addEventListener("load", function() {
  var elem = document.querySelectorAll(".jirainfo"),
    conf = {
      trigger: JSINFO['jirainfo']['trigger'] || "click",
      placement: "left"//JSINFO['jirainfo']['placement'] || "top"
    },  
    i = 0, // counter of elements
    loadIcon = '<div class="icon-load"></div>';                 
    
  for (let i = 0; i < elem.length; i++) {
    if (conf.trigger == "hover") {
      elem[i].addEventListener("mouseover", init);
    }
      elem[i].addEventListener(conf.trigger, init);
  }

  function init() {    
    var pop = new jiPopover(this);        
    pop.show(this);
    // if pop-element is created then only show, without getData
    if (pop.key) pop.getDataByKey();       
  }
    
  /**
   * Class jiPopover
   * @constructor
   * @param  {} elem target element
  */
  function jiPopover(elem) {    
    // before hide other pop-elements
    this.hide();     

    if (this.checkPopCreated(elem)) {            
      this.id = elem.getAttribute("data-target");      
    } else {
      this.id  = "jiPopover" + ++i;
      this.key = elem.getAttribute("data-key"); 
      elem.setAttribute("data-target", this.id);              
      this.create();        
    }      
  };
  /**
   * Create the popover-element with arrow and content
   * @method    
   */
  jiPopover.prototype.create = function() {
      let pop = document.createElement("div");

      pop.className = "ji-popover pop pop-out";      
      pop.id = this.id;
      pop.appendChild(this.setArrowElement());
      pop.appendChild(this.setPopContent(loadIcon));      
      document.body.appendChild(pop);      
  };
  /**
   * Show the popover-element
   * @method
   * @param  {HTMLElement} elem target element   
   */
  jiPopover.prototype.show = function(elem) {           
    let pop = this.getPopElementByName(),
        obj = this;         
    
    this.setArrowPosition(conf.placement);        

    this.popper = new Popper(elem, pop, {
      placement: conf.placement,
      modifiers: {
        offset: { offset: "0, 10px" },
        arrow: {
          element: obj.getPopElementByName("arrow")          
        },
        computeStyle: { gpuAcceleration: false }
      },
      onCreate: function(data) {
        
      },
      onUpdate: function(data) {
        obj.setArrowPosition(data);
        obj.getPopElementByName("body").style.opacity = 1; // pop-content-body                         
      }
    });              

    pop.style.display = "block";
    setTimeout(function () {
      pop.classList.remove("pop-out");
      pop.classList.add("pop-in");
    }, 50);

    
    this.handlerHidePop();
  };  
  /**
   * Hide opened pop-element   
   * @method
   */
  jiPopover.prototype.hide = function() {        
    let pop = document.querySelector(".ji-popover.pop-in");
    // if found open popover-element, close him
    if (pop) {
      setTimeout(function() { pop.style.display = "none"; }, 50);
      pop.classList.remove("pop-in");
      pop.classList.add("pop-out");
    }            
  };

  jiPopover.prototype.checkPopCreated = function(elem) {
    return elem.hasAttribute("data-target");
  };

  // Hide poppers by click or mouseover element
  jiPopover.prototype.handlerHidePop = function() {
    let obj = this;
    switch (conf.trigger) {
      case 'click':
        //document.addEventListener("click", function(event) {              
        document.onclick = function(event) {
          if (event.target.className != "jirainfo") {        
            event.stopPropagation();
            obj.hide();
          }
        };  
        break;
      
      case 'hover':                      
        document.addEventListener("mouseout", function (event) {
            if (event.target.classList[0] != "jirainfo"
              // || el.classList[0] != "ji-popover-content"
              // || el.classList[0] != "ji-arrow"
              // || el.parentElement.classList[0] != "ji-popover-content"
              // || el.parentElement.parentElement.classList[0] != "ji-popover-content"
            ) {
              event.stopPropagation();
              obj.hide()
            }
        });        
        break;
    }  
  };       
  /**
   * Create the content in the popover-element
   * @method
   * @param  {string} content - icon-load
   * @return {Element} 
   */
  jiPopover.prototype.setPopContent = function(content) {
    let popContent = document.createElement("div");
      
    popContent.className = "ji-popover-content";
    popContent.innerHTML = content;
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
    arrow.className = "ji-arrow";  
    return arrow;
  };  
  /**
   * Set position arrow-element 
   * @method
   * @param  {dataObject} data object popover.js  
   */
  jiPopover.prototype.setArrowPosition = function(data) {            
    const arrow = this.getPopElementByName("arrow");    
    // for update elements
    if (data.placement) {
      arrow.classList.remove("arrow-" + data.originalPlacement);
      arrow.classList.add("arrow-" + data.placement);                
    // for create elements
    } else {
      arrow.classList.add("arrow-" + conf.placement);           
    }
  };   
  /**
   * Returns elements popover by their a name 
   * @method
   * @param  {string} name arrow, content, body, and by default(null) popover
   * @return {Element}
   */
  jiPopover.prototype.getPopElementByName = function(name) {
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
    var obj = this;
    jQuery.post(
      DOKU_BASE + "lib/exe/ajax.php",
      {
        call: "plugin_jirainfo",
        key: this.key
      },
      function(data) { obj.fillPopBody(JSON.parse(data)); }
      //,'json'
    );
  };
  jiPopover.prototype.fillPopBody = function(obj) {
      // if task not found or does not exist     
    if (obj.errors) {
      this.updContent(obj.errors);
      return;
    }

    var html = '<div class="ji-popover-content-body">';
    html +=
      '<p class="summary">'+ obj.summary +"</p>" +
      '<div class="status"><span class="color-'+ obj.status.color +'">' + obj.status.name +"</span></div>" +
      '<img src="'+ obj.issuetype.iconUrl +'" class="issuetype" title="'+ obj.issuetype.name +'">';
  
    html += obj.totalComments ? '<div class="comment-circle"><span class="total_comments">'+ 
            obj.totalComments + "</span></div>" : "";
    html += '<a href="' + obj.issueUrl + '"class="key_link">' + obj.key + "</a>";
    html += '</div>';

    this.updContent(html);
  };
  jiPopover.prototype.updContent = function(html) {
    this.getPopElementByName('content').innerHTML = html; // pop-content    
    // init method onUpdate in popper.js
    this.popper.scheduleUpdate();     
  }  
});