/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
       
        document.addEventListener("backbutton", onBackKeyDown, false);
        //document.addEventListener("pause", onBackKeyDown, true);
        
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
        
        $('#deviceready').hide();
        //$('#meli-query').show();
        switchToView('meli-query');
    },
 // post-submit callback 
    getQueryResponse: function (responseObject, statusText, xhr, $form)  { 
        
    	console.log("hooray");
    	//$('#meli-loading').hide();
    	//$('#meli-results').show();
    	
    	queryID = responseObject.id;
    	queryProducts = responseObject.results;
    	currentPage = responseObject.page;
    	nPages = responseObject.nPages;
    	
    	switchToView('meli-results');
    	
    	//console.log(responseObject);
       // alert('status: ' + statusText + '\n\nresponseText: \n' + responseText + 
        //    '\n\nThe output div should have already been updated with the responseText.'); 
    },
    
    
};

var currentView = 'meli-query';

var queryID;
var queryProducts;
var currentPage;
var nPages;

var queryOptions = { 
    //target:        '#output1',   // target element(s) to be updated with server response 
    //beforeSubmit:  app.prepareQuery,  // pre-submit callback 
    success:       app.getQueryResponse,  // post-submit callback 
 
        // other available options: 
    url:       'http://192.168.80.168:3000/search',       // override for form's 'action' attribute 
    type:      'get',        // 'get' or 'post', override for form's 'method' attribute 
    dataType:  'json',        // 'xml', 'script', or 'json' (expected server response type) 
    //clearForm: true        // clear all form fields after successful submit 
    //resetForm: true        // reset the form after successful submit 
 
        // $.ajax options can be used here too, for example: 
    timeout:   60000 
};

function geoSuccess(position) {
	
	var lat = position.coords.latitude;
	var lon = position.coords.longitude;
	
	console.log("got pos.");
	$('input#lat').val(lat);
	$('input#long').val(lon);
	
	$('#query-form').ajaxSubmit(queryOptions);
	console.log("submitted form");
	
};

function geoFail(error) {
	console.log("Something went wrong");
	console.log(error);
};

function prepareQuery() {
	
	//$('#meli-query').hide();
	//$('#meli-loading').show();
	switchToView('meli-loading');
	console.log("getting my location");
	navigator.geolocation.getCurrentPosition(geoSuccess,geoFail,{enableHighAccuracy:true});
	return false;
}

function updateMeliResults()
{
	var html = '';
	$('#results-table tr').remove();
	for(var i=0; i<queryProducts.length; i++)
	{
		html += '<tr onclick="goToPage('+ String(i) + ');"><td><img src=' + queryProducts[i].thumbnail + ' width="100" height="100"></td>'
				+ '<td>' + queryProducts[i].title + '</td>'
				+ '<td>' + queryProducts[i].currency_id + String(queryProducts[i].price) + '</td></tr>'
				
		html += '<tr><td></td><td>' + queryProducts[i].address.city_name + '</td><td>~' + String((queryProducts[i].distance_to_me).toFixed(2)) + 'km.</td></tr>'
	}
	$('#results-table').append(html);
}

//prepare the form when the DOM is ready 
$(document).ready(function() { 
    
	setTimeout(function () {
		myScroll = new iScroll('wrapper', { zoom: true });
	}, 100);
    $('#meli-login').hide();
    $('#meli-loading').hide();
	$('#meli-query').hide();
	$('#meli-results').hide();
	$('#meli-map').hide();
    // bind form using 'ajaxForm' 
  //  $('#query-form').ajaxForm(queryOptions);
    
    $('#query-form').submit(prepareQuery);
}); 
 
function onBackKeyDown(e){
	
	var view = currentView;
	
	console.log('listener was called indeed');
	e.preventDefault();
	switch(currentView)
	{
	case 'meli-login':
		navigator.app.exitApp();
		break;
	case 'meli-results':
		view = 'meli-query';
		break;
	case 'meli-loading':	
		view = 'meli-query';
		break;
	case 'meli-query':
		navigator.app.exitApp();
		break;
	case 'meli-map':
		view = 'meli-query';
		break;
	//case 'meli-product':
	//	view = 'meli-results';
	//	currentPage.close();
	//	break;
	
	}
	
	switchToView(view);
	return false;
}

function switchToView(view) {
	currentView = view;
	
	$('.app-view').hide();
	$('.'+currentView).show();
	if(currentView=='meli-results')
	{
		updateMeliResults();
	}
	else if(currentView=='meli-map')
	{
		generateMeliMap();
	}
}

var currentPage;
function goToPage(ind){
	//currentView = 'meli-product';
	currentPage = window.open(queryProducts[ind].permalink, '_blank', 'location=yes');
}

function generateMeliMap(){
	
}
