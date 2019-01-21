window.addEventListener("load", function() {
  var elem = document.querySelectorAll(".jirainfo"),
    conf = {
      trigger: "click",
      placement: "right"
    },  
    i = 0; // counter of elements
    
  for (let i = 0; i < elem.length; i++) {
    if (conf.trigger == "hover") {
      elem[i].addEventListener("mouseout", function() { destroy(); });
    }
      elem[i].addEventListener(conf.trigger, init);
  }

  function init() {    
    var pop = new jiPopover(this);    
    pop.show(this, pop.content);
    pop.getDataByKey(pop);   
  }
    
  class jiPopover {

    constructor(elem) { 
      this.hide();     

      if (elem.getAttribute("data-target")) {        
        this.content = document.getElementById(elem.getAttribute("data-target"));
      } else {
        this.id  = "jiPopover" + ++i;
        this.key = elem.getAttribute("data-key"); 
        elem.setAttribute("data-target", this.id);        
        this.content = this.create();        
      }      
    }
    show(elem, pop) {     
      this.popper = new Popper(elem, pop, {
        placement: conf.placement,
        modifiers: {
          offset: { offset: "0 10px 0 0"}
        },        
        onCreate: data => {                  
          this.setArrowPosition(data);
        },
        onUpdate: data => {
          this.setArrowPosition(data);          
        }
      });  
    
      pop.style.display = "block";
      pop.classList.remove("out");
      pop.classList.add("in");         
    }
    create(){
      let pop = document.createElement("div");

      pop.className = "ji-popover pop out";
      pop.id = this.id;
      pop.appendChild(this.getArrowElement());
      pop.appendChild(this.getPopContent('test'));

      document.body.appendChild(pop);
      return pop;
    }
    getArrowElement() {
      let arrow = document.createElement("div");
      arrow.className = "ji-arrow";  
      return arrow;
    }
    setArrowPosition(data) {
      var arrow = document.getElementById(this.id).children[0];            
      if (conf.placement == 'left' || conf.placement == 'right') {
        // add class position arrow-element
        arrow.classList.remove("arrow-" + data.originalPlacement);
        arrow.classList.add("arrow-" + data.placement);
        // top position
        arrow.style.top = data.popper.height / 2 - 12 + "px";      
      } else {
        arrow.classList.remove("arrow-" + data.originalPlacement);
        arrow.classList.add("arrow-" + data.placement);        
        //console.log(data.popper);
        arrow.style.left = data.popper.width / 2 - 12 + "px";      
      }

    }
    getPopContent(content) {
      let popContent = document.createElement("div");
      
      popContent.classList = "ji-popover-content";
      popContent.innerHTML = content;
      return popContent;
    }    
    getDataByKey(obj) {
      jQuery.post(
        DOKU_BASE + "lib/exe/ajax.php",
        {
          call: "plugin_jirainfo",
          key: this.key
        },
        function(data) { obj.fillPopBody(JSON.parse(data)); }
        //,'json'
      );
    }
    fillPopBody(obj) {
      var html =
        '<p class="summary">'+ obj.summary +"</p>" +
        '<div class="status"><span class="color-'+ obj.status.color +'">' + obj.status.name +"</span></div>" +
        '<img src="'+ obj.issuetype.iconUrl +'" class="issuetype" title="'+ obj.issuetype.name +'">';
    
      html += obj.totalComments ? '<div class="comment-circle"><span class="total_comments">'+ 
              obj.totalComments + "</span></div>" : "";
      html += '<a href="' + obj.issueUrl + '"class="key_link">' + obj.key + "</a>";

      document.getElementById(this.id).children[1].innerHTML = html;
      // init method onUpdate in popper.js
      this.popper.scheduleUpdate();     
    }
    hide() {      
      let pop = document.querySelectorAll(".ji-popover");      
      for (let i = 0; i < pop.length; i++) {
        pop[i].classList.remove("in");
        pop[i].classList.add("out");
        pop[i].style.display = "none";
      }      
      if (conf.trigger == 'click') this.clickOutElement(this);
    }
    clickOutElement(obj) {
      document.addEventListener("click", function(event) {      
        if (event.target.className != "jirainfo") {        
          event.stopPropagation();
          obj.hide();
        }
      });
    }
  }
});