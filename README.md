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
        target.append('<div class="el-control"> <i class="fa fa-chevron-left" aria-hidden="true"></i> <i class="fa fa-chevron-right" aria-hidden="true"></i> <i class="fa fa-times" aria-hidden="true"></i> </div>');
        registrarEventos(target);
        //GM_addValueChangeListener(target, valueChanged);

        $('body').off('click',insertControl);
    }

    /*
    /   Deserealiza la informacion almacenada en el storage ( json format )
    /
    */
    function obtenerStorage (target) {
        // set nuevo valor
        if (!GM_getValue(target.get(0).baseURI,false)){
            GM_setValue(target.get(0).baseURI, JSON.stringify([]) );
        }
        return JSON.parse(GM_getValue(target.get(0).baseURI,false));
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
        //var arr = s[target.get(0)] ?  s[target.get(0)] : [];

        if( true ) // obtiene la posicion del elemento
            s.push = { el : target.get(0).outerHTML , snapShot : [] };
        //s[1].snapShot.push(target.get(0).outerHTML());
        //s[target.get(0)].push(target.get(0).outerHTML());
        return GM_setValue(target.get(0).baseURI, JSON.stringify( s) );
    }

    function registrarEventos(target){
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
        observer.observe(target.get(0), { attributes: true, childList: true, characterData: true , subtree:true , characterDataOldValue: true});
    }

    function seleccionarElemento(){
        //GM_setValue('tgSel', !GM_getValue('tgSel', false));
       /// console.log('seleccionando: ' + GM_getValue('tgSel', false));
        //GM_notification(details, ondone), GM_notification(text, title, image, onclick)
        $('body').on('click',insertControl);
    }



    GM_registerMenuCommand('Seleccionar Elemento', seleccionarElemento, 'n');

    GM_addStyle (
        ".el-control{     right: 1%;    z-index: 9999;    bottom: -5%;    padding: 5px;    color: #333;    text-align: center; position: absolute; opacity: 0}" +
        ".el-control i { font-size: 1.5em }" +
        ".selected-tmp:hover {    border: 2px solid #e3e3e3;} " +
        ".selected-tmp:hover .el-control { opacity: 1}"
    );
})();
