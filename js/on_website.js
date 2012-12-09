
// This is a content script.

// That means the script is called when any page is loaded. This script does
// not have access to the rest of the extension's stuff, like localStorage.
// Therefore the script needs to send requests about variables in storage
// to the extension.

// It is important to just use regular javascript here, at most some jQuery.
// Remember that the environment you are in here is NOT the extension, it
// might be an old, insecure website. Except, of course, we are visiting the
// Online website which is secured by our most paranoid guy, Rockj ;)

var host = window.location.host;

if (host == 'online.ntnu.no') {
	$('#install_notifier').hide();
	chrome.extension.sendRequest({'action' : 'resetCounterWhenOnWebsite'});
}

if (host == 'sit.no') {
	chrome.extension.sendRequest({'action' : 'showCantina'}, function(showCantina) {
		if (showCantina == 'true') {
			
			// If we're at a dinner info page
			if (document.URL.indexOf('pa-Hangaren') != -1 || document.URL.indexOf('pa-Realfag') != -1) {
		
				// Find out which day it is
				var today = new Date().getDay() - 1;
				if (today == -1) today = 6;
		
				// Highlight day
				$('#menytable tbody:first tr[valign=top]').eq(today).children(':first').attr("style","background-color:#988d14;color:white;font-weight:bold;");
		
				// Highlight chosen dinner (chosen from the popup)
				chrome.extension.sendRequest({'action' : 'getChosenDinner'}, function(response) {
					if (response != null) {
						// Highlight chosen dinner
						$('#menytable tbody:first tr[valign=top]').eq(today).children(':last').find('tbody').children().eq(response).children().attr("style","font-weight:bold;");
						// Decide how far we need to scroll down to the table
						var offset;
						var tableOffset = $('#menytable').position().top;
						if ($('#menytable').find('tr').eq(1).find('tr').length <= 1) {
							offset = tableOffset - 180;
						}
						else {
							offset = (tableOffset - 50) + (today * 50);
						}
						// Scroll down to reveal the highlighted dinner
						window.scrollTo(0,(offset));
					}
				});
				
				// Add a notification in the source about edited code
				chrome.extension.sendRequest({'action':'dismissedSitNotice'}, function(dismissedSitNotice) {
					if (dismissedSitNotice != 'true') {
						var optionsPage = chrome.extension.getURL('options.html');
						var smallOnlineLogo = chrome.extension.getURL('img/logo-48.png');
						$('#menytable').after('<div id="onlineNotice" style="border:1pt solid #ddd;padding:0 0 16pt 10pt;"><br />'+
								'<img src="'+smallOnlineLogo+'" style="float:left;width:1.5em;margin:0em .4em;-webkit-filter:grayscale(50%);">'+
								'<span style="font-size:.9em;position:relative;top:.2em;color:gray;">'+
								'<a href="'+optionsPage+'" style="text-decoration:underline;color:gray;">Notifier</a> '+
								'har uthevet menyen for deg <3 '+
								'<span id="hideOnlineNotice" style="text-decoration:underline;cursor:pointer;">OK, dismiss</span>'+
								'</span><br /></div>');
						$('#hideOnlineNotice').click(function() {
							chrome.extension.sendRequest({'action':'dismissSitNotice'}, function(success) {
								if (success) {
									$('#onlineNotice').slideUp('slow');
								}
								else {
									$('#hideOnlineNotice').text('Oops, cannot contact Notifier :(');
								}
							});
						});
					}
				});
			}
		}
	});
}







