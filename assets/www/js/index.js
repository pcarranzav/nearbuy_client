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

var nearbuyServer = "http://near-buy.herokuapp.com";
var getSearchURL = nearbuyServer + '/search';
var pingURL = nearbuyServer + '/ping';

function getSearchPageURL(id,page) {
	return nearbuyServer + '/searches/' + String(id) + '/' + String(page); 
}

function getMapURL(id) {
	return nearbuyServer + '/searches/' + String(id) + '/map';
}

function getCityListURL(id,cid) {
	return nearbuyServer + '/searches/' + String(id) + '/map/' + String(cid);
}

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

        $('#meli-login').hide();
        $('#meli-loading').hide();
    	$('#meli-query').hide();
    	$('#meli-results').hide();
    	$('#meli-map').hide();

        $('#query-form').submit(prepareQuery);
        $.get(pingURL, function(data){} , "json");
        
        $('#deviceready').hide();
        //$('#meli-query').show();
        switchToView('meli-query');
    }
    
    
};


// post-submit callback 
function getQueryResponse(responseObject, statusText, xhr, $form)  { 
    
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
}

var currentView = 'meli-query';

var queryID;
var queryProducts;
var currentPage;
var nPages;
function queryError(jXHR,textStatus,errorThrown )
{
	console.log('wtwtf?');
	$('#error-message').show;
	console.log(jXHR);
	console.log(textStatus);
	console.log(errorThrown);
}
var queryOptions = { 
    //target:        '#output1',   // target element(s) to be updated with server response 
    //beforeSubmit:  app.prepareQuery,  // pre-submit callback 
    success:       getQueryResponse,  // post-submit callback 
 
    // other available options: 
    url:       getSearchURL,       // override for form's 'action' attribute 
    type:      'get',        // 'get' or 'post', override for form's 'method' attribute 
    dataType:  'json',        // 'xml', 'script', or 'json' (expected server response type) 
    //clearForm: true        // clear all form fields after successful submit 
    //resetForm: true        // reset the form after successful submit 
 
        // $.ajax options can be used here too, for example: 
    timeout:   60000 ,
    error: queryError
};

var lat;
var lon;

function geoSuccess(position) {
	
	lat = position.coords.latitude;
	lon = position.coords.longitude;
	
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


var myScroll = null;

$(document).ready(function() { 
    
	app.initialize();
    
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
	if(myScroll != null)
	{
		myScroll.destroy();
		myScroll = null;
	}
	if(currentView=='meli-results')
	{
		updateMeliResults();
		//setTimeout(function () {
		//	myScroll = new iScroll('wrapper', { zoom: true });
		//}, 200);
	}
	else if(currentView=='meli-map')
	{
		generateMeliMap();
	}
	//myScroll.refresh();
    //myScroll.scrollTo(0, 0, 1000);
}

var currentPage;
function goToPage(ind){
	//currentView = 'meli-product';
	currentPage = window.open(queryProducts[ind].permalink, '_blank', 'location=yes');
}
var myMap;
function generateMeliMap(){
	var mapOptions = {
	  center: new google.maps.LatLng(lat, lon),
	  zoom: 10,
	  mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	//$("#map-canvas").remove();
	//var canvas=$("map-container").append("<div id='map-canvas' style='width: 100%; height: 300px;'></div>");
	
	myMap = new google.maps.Map(document.getElementById('map-canvas'),
		    mapOptions);
	
	$.get(getMapURL(queryID), generateMapOverlays , "json");
	
}

var total;
var mapArr;
var circ;
var labels;
var myLatLng;

function generateMapOverlays(data) {
	total = data.total;
	mapArr = data.map;
	circ = [];
	labels = [];
	myLatLng = new google.maps.LatLng(lat,lon);
	for(var i=0;i<mapArr.length;i++)
	{
		var thisLatLng = new google.maps.LatLng(mapArr[i].latitude,mapArr[i].longitude)
		circ[i] = new google.maps.Circle({
            center: thisLatLng,
            clickable:true,
            fillColor:"#0000FF",
            fillOpacity:0.1, 
            map:myMap,
            radius:mapArr[i].radius*700,
            strokeColor:"#777777",
            strokeOpacity:0.1});
		
		addCircleListener(mapArr,i,circ[i]);
		
		
        var myOptions = {
                 content: String(mapArr[i].count)
                ,boxStyle: {
                   border: "0px"
                  ,textAlign: "center"
                  ,fontSize: "14pt"
                  ,fontWeight: "bold"
                  ,width: "50px"
                 }
                ,disableAutoPan: true
                ,pixelOffset: new google.maps.Size(-25, 0)
                ,position: thisLatLng
                ,closeBoxURL: ""
                ,isHidden: false
                ,pane: "mapPane"
                ,enableEventPropagation: true
        };

        var ibLabel = new InfoBox(myOptions);
        ibLabel.open(myMap);
		
	}
	
	 var marker = new google.maps.Marker({
	      position: myLatLng,
	      map: myMap,
	      title:"Estas aca!"
	  });
}

function goToCityList(responseObject) {
	console.log("hooray");
	//$('#meli-loading').hide();
	//$('#meli-results').show();
	
	queryProducts = responseObject.list;
	currentPage = 1;
	nPages = 1;
	
	switchToView('meli-results');
}
function addCircleListener(mapArr,i,myCirc)
{
	google.maps.event.addListener(myCirc, 'click', function(ev){
		   var city_id = mapArr[i].id;
		   $.get(getCityListURL(queryID,city_id), goToCityList , "json");
		});
}
