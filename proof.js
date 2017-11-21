// ==UserScript==
// @name         Obj II
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @include *
// @grant        GM_registerMenuCommand
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @grant        GM_addValueChangeListener
// @grant        GM_listValues

// @require http://code.jquery.com/jquery-latest.js
// @require https://use.fontawesome.com/f4f6b143ec.js
// ==/UserScript==

(function() {
    'use strict';

    function valueChanged(name, old_value, new_value, remote) {
        console.log('name: ' + name);
        console.log('old value: ' + old_value);
        console.log('new value: ' + new_value);
        console.log('was the value change not by this page? ' + remote);
    }

    function insertControl(event){
        console.log('elemento seleccionado..');
        console.log(event);
        // Selecciono el div
        var target = event.target.tagName.toLowerCase() == 'div' ? $(event.target) : $(event.target).parent('div');
        // Inserto algunos controles
        //target.append('<input type="button" class="el-control" value="Open" id="CP">');
        target.addClass('selected-tmp');
        target.append('<div class="el-control"> <i class="fa fa-history history" title="Historial" aria-hidden="true"></i> <i class="fa fa-times unbind" title="Eliminar" aria-hidden="true"></i> </div>');
        registrarEventos(target);
        //GM_addValueChangeListener(target, valueChanged);

        $('body').off('click',insertControl);
    }

    /*
    /   Deserealiza la informacion almacenada en el storage ( json format )
    /
    */
    function obtenerStorage (target) {
        // set nuevo valor ( deberia ser target.get(0).baseURI )
        if (!GM_getValue(target.get(0).baseURI, false)){
            GM_setValue(target.get(0).baseURI, JSON.stringify({}) );
        }
        //var resp = JSON.parse(GM_getValue(target.get(0).baseURI,false))
        var resp = JSON.parse(GM_getValue(target.get(0).baseURI, false));
        return resp;
        //set nuevo elemento a registrar bajo esa uri
        /* if( !r[target.get(0)]  ){
            r[target.get(0)] = [];
        }
        return r[target.get(0)];
        */
    }


    /*
    /  Actualiza el valor previamente almacenado
    /
    */
    function actualizarStorage( target ) {
        // Recupero el objeto
        var s = obtenerStorage(target);
        var xpath = getPathTo(target.get(0));
        //var arr = s[target.get(0)] ?  s[target.get(0)] : [];

        if( !s.captures ) // Si no hay capturas en este sitio la creo
        {
            s.captures = [];
        } // Tiene capturas ,reviso el xpath del elem
            //s.captures  = JSON.parse(s.captures);
        var capture = s.captures.find(function(e){
            return e.xpath == xpath;
        });
        if ( !capture ){
            capture = {  xpath : xpath, snapShots : [] } ;
            s.captures.push ( capture );
        }
        //if ( capture.snapShots.length > 0 ) // tiene capturas previas las deserealizo
        //    capture.snapShots = JSON.parse(capture.snapShots);
        capture.snapShots.push(target.get(0).outerHTML);


        //s.captures = { el : target.get(0).outerHTML , snapShot : [] };
        //s[1].snapShot.push(target.get(0).outerHTML());
        //s[target.get(0)].push(target.get(0).outerHTML());
        console.log ( ' Element updated');
        return GM_setValue(target.get(0).baseURI, JSON.stringify( s ));
    }

    function eliminarStorage( target){
        var s = GM_getValue(target.get(0).baseURI, false);
         if ( s ){
             s = JSON.parse(s);
             if ( s.captures ) {
                 var xpath = getPathTo(target.get(0));
                 if( typeof s.captures == "string" ){
                     s.captures = JSON.parse( s.captures );
                 }
                 var capture = s.captures.find(function(e){
                     return e.xpath == xpath;
                 });
                 if( capture ){
                     var index = s.captures.indexOf(capture);
                     s.captures.splice(capture, 1);
                     GM_setValue(target.get(0).baseURI, JSON.stringify( s ));

                 }
             }
         }
    }

    function showHistory (target){
        // Dejo la deteccion de cambios en espera..
        target.trigger('disconnect');
        target.find('.el-control').addClass('history-mode');
        var s = obtenerStorage(target);
        // Fix temporal para json parse ?
        if ( typeof s.captures == "string" )
            s.captures = JSON.parse(s.captures);
        target.append('<div class="el-history-control" el="' + s.captures.length +'"> <i class="fa fa-chevron-left" title="anterior estado" aria-hidden="true"></i> <i class="fa fa-chevron-right" title"siguiente estado" aria-hidden="true"></i> <i class="fa fa-level-up back" title="Volver" aria-hidden="true"></i> </div>');
        target.find('.next').on('click',function(){
            nextElement(target);
        });
        target.find('.prev').on('click',function(){
            prevElement(target);
        });
        target.find('.back').on('click', function(){
            // Vuelvo a mostrar los controles originales y detectar cambios
            target.find('.el-history-control').remove();
            target.find('.el-control').removeClass('history-mode');
            target.trigger('reconnect');
        });

    }

    function nextElement(target){

        //Test slide?
        /*
        $('#slidemarginleft button').click(function() {
            var $marginLefty = $(this).next();
            $marginLefty.animate({
                marginLeft: parseInt($marginLefty.css('marginLeft'),10) == 0 ?
                $marginLefty.outerWidth() :
                0
            });
        });
        */
    }

    function prevElement(target){

    }

    function registrarEventos(target){
        target.find('.unbind').on('click', function(){unbindElement(target);});
        target.find('.history').on('click', function(){showHistory(target);});
        // clean store
        //GM_setValue(target.get(0).baseURI, null);
        var observer = new MutationObserver(function(mutations) {
            // mutations.forEach(function(mutation) {
            //              for (var i = 0; i < mutation.addedNodes.length; i++)
            //                    insertedNodes.push(mutation.addedNodes[i]);
            //   console.log(mutation);
            //});
            if ( target.get(0)){
                //var s = crearStorage(target);
                // guardo el nuevo valor de ese target
                //s.push(target.get(0).cloneNode(true));
                actualizarStorage(target);
            }
        });
         // futuras operaciones
        target.on('disconnect',function(){
            observer.disconnect();
        });
        target.on('reconnect',function(){
            observer.observe(target.get(0), { attributes: true, childList: true, characterData: true , subtree:true , characterDataOldValue: true});
        });
        observer.observe(target.get(0), { attributes: true, childList: true, characterData: true , subtree:true , characterDataOldValue: true});
    }

    function unbindElement(target){
        if( confirm('¿Eliminar elemento?') ){
            eliminarStorage(target);
            target.trigger('disconnect');
            target.removeClass('selected-tmp');
            target.find('.el-control').remove();
        }
    }

    function seleccionarElemento(){
        //GM_setValue('tgSel', !GM_getValue('tgSel', false));
        /// console.log('seleccionando: ' + GM_getValue('tgSel', false));
        //GM_notification(details, ondone), GM_notification(text, title, image, onclick)
        $('body').on('click',insertControl);
    }

    /*
    function getXPathForElement(el, xml) {
        var xpath = '';
        var pos, tempitem2;

        while(el !== xml.documentElement) {
            pos = 0;
            tempitem2 = el;
            while(tempitem2) {
                if (tempitem2.nodeType === 1 && tempitem2.nodeName === el.nodeName) { // If it is ELEMENT_NODE of the same name
                    pos += 1;
                }
                tempitem2 = tempitem2.previousSibling;
            }

            xpath = "*[name()='"+el.nodeName+"' and namespace-uri()='"+(el.namespaceURI===null?'':el.namespaceURI)+"']["+pos+']'+'/'+xpath;

            el = el.parentNode;
        }
        xpath = '/*'+"[name()='"+xml.documentElement.nodeName+"' and namespace-uri()='"+(el.namespaceURI===null?'':el.namespaceURI)+"']"+'/'+xpath;
        xpath = xpath.replace(/\/$/, '');
        return xpath;
    }
*/

    function getPathTo(element) {
        //if (element.id!=='')      return "//*[@id='"+element.id+"']";

        if (element===document.body)
            return element.tagName.toLowerCase();

        var ix= 0;
        var siblings= element.parentNode.childNodes;
        for (var i= 0; i<siblings.length; i++) {
            var sibling= siblings[i];

            if (sibling===element) return getPathTo(element.parentNode) + '/' + element.tagName.toLowerCase() + '[' + (ix + 1) + ']';

            if (sibling.nodeType===1 && sibling.tagName === element.tagName) {
                ix++;
            }
        }
    }

    function getElementByXpath(path) {
        return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    }

    GM_registerMenuCommand('Seleccionar Elemento', seleccionarElemento, 'n');

    GM_addStyle (
        ".el-control, .el-history-control {     right: 1%;    z-index: 9999;    bottom: -5%;    padding: 5px;    color: #333;    text-align: center; position: absolute; opacity: 0}" +
        ".el-control, .el-history-control i { font-size: 1.5em; cursor : pointer }" +
        ".selected-tmp:hover {    border: 2px solid #e3e3e3;} " +
        ".selected-tmp:hover .el-control { opacity: 1}"+
        ".selected-tmp:hover .el-history-control { opacity: 1}"+
        ".history-mode { display:none }"
    );

    console.log ( ' script rdy' );
})();
