// Generated by CoffeeScript 1.4.0
(function() {
  var $, chatterText, clickDinnerLink, createBusDataRequest, displayItems, fadeButtonText, findUpdatedPosts, insertBusInfo, iteration, listDinners, ls, mainLoop, newsLimit, optionsText, updateBus, updateCantinas, updateCoffee, updateHours, updateMeetings, updateNews, updateServant,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  $ = jQuery;

  ls = localStorage;

  iteration = 0;

  newsLimit = 4;

  mainLoop = function() {
    if (DEBUG) {
      console.log("\n#" + iteration);
    }
    if (iteration % UPDATE_SERVANT_INTERVAL === 0 && ls.showOffice === 'true') {
      updateServant();
    }
    if (iteration % UPDATE_MEETINGS_INTERVAL === 0 && ls.showOffice === 'true') {
      updateMeetings();
    }
    if (iteration % UPDATE_COFFEE_INTERVAL === 0 && ls.showOffice === 'true') {
      updateCoffee();
    }
    if (iteration % UPDATE_CANTINAS_INTERVAL === 0 && ls.showCantina === 'true') {
      updateCantinas();
    }
    if (iteration % UPDATE_HOURS_INTERVAL === 0 && ls.showCantina === 'true') {
      updateHours();
    }
    if (iteration % UPDATE_BUS_INTERVAL === 0 && ls.showBus === 'true') {
      updateBus();
    }
    if (iteration % UPDATE_NEWS_INTERVAL === 0) {
      updateNews();
    }
    if (10000 < iteration) {
      iteration = 0;
    } else {
      iteration++;
    }
    return setTimeout((function() {
      return mainLoop();
    }), PAGE_LOOP);
  };

  updateServant = function() {
    if (DEBUG) {
      console.log('updateServant');
    }
    return Servant.get(function(servant) {
      return $('#todays #schedule #servant').html('- ' + servant);
    });
  };

  updateMeetings = function() {
    if (DEBUG) {
      console.log('updateMeetings');
    }
    return Meetings.get(function(meetings) {
      meetings = meetings.replace(/\n/g, '<br />');
      return $('#todays #schedule #meetings').html(meetings);
    });
  };

  updateCoffee = function() {
    if (DEBUG) {
      console.log('updateCoffee');
    }
    return Coffee.get(true, function(pots, age) {
      $('#todays #coffee #pots').html('- ' + pots);
      return $('#todays #coffee #age').html(age);
    });
  };

  updateCantinas = function() {
    if (DEBUG) {
      console.log('updateCantinas');
    }
    Cantina.get(ls.left_cantina, function(menu) {
      $('#cantinas #left .title').html(ls.left_cantina);
      $('#cantinas #left #dinnerbox').html(listDinners(menu));
      return clickDinnerLink('#cantinas #left #dinnerbox li');
    });
    return Cantina.get(ls.right_cantina, function(menu) {
      $('#cantinas #right .title').html(ls.right_cantina);
      $('#cantinas #right #dinnerbox').html(listDinners(menu));
      return clickDinnerLink('#cantinas #right #dinnerbox li');
    });
  };

  listDinners = function(menu) {
    var dinner, dinnerlist, _i, _len;
    dinnerlist = '';
    if (typeof menu === 'string') {
      ls.noDinnerInfo = 'true';
      dinnerlist += '<li>' + menu + '</li>';
    } else {
      ls.noDinnerInfo = 'false';
      for (_i = 0, _len = menu.length; _i < _len; _i++) {
        dinner = menu[_i];
        if (dinner.price !== null) {
          dinner.price = dinner.price + ',- ';
          dinnerlist += '<li id="' + dinner.index + '">' + dinner.price + dinner.text + '</li>';
        } else {
          dinnerlist += '<li class="message" id="' + dinner.index + '">"' + dinner.text + '"</li>';
        }
      }
    }
    return dinnerlist;
  };

  clickDinnerLink = function(cssSelector) {
    return $(cssSelector).click(function() {
      Browser.openTab(Cantina.url);
      return window.close();
    });
  };

  updateHours = function() {
    if (DEBUG) {
      console.log('updateHours');
    }
    Hours.get(ls.left_cantina, function(hours) {
      return $('#cantinas #left .hours').html(hours);
    });
    return Hours.get(ls.right_cantina, function(hours) {
      return $('#cantinas #right .hours').html(hours);
    });
  };

  updateBus = function() {
    if (DEBUG) {
      console.log('updateBus');
    }
    if (!navigator.onLine) {
      $('#bus #first_bus .name').html(ls.first_bus_name);
      $('#bus #second_bus .name').html(ls.second_bus_name);
      $('#bus #first_bus .first .line').html('<div class="error">Frakoblet fra api.visuweb.no</div>');
      return $('#bus #second_bus .first .line').html('<div class="error">Frakoblet fra api.visuweb.no</div>');
    } else {
      createBusDataRequest('first_bus', '#first_bus');
      return createBusDataRequest('second_bus', '#second_bus');
    }
  };

  createBusDataRequest = function(bus, cssIdentificator) {
    var activeLines;
    activeLines = ls[bus + '_active_lines'];
    activeLines = JSON.parse(activeLines);
    return Bus.get(ls[bus], activeLines, function(lines) {
      return insertBusInfo(lines, ls[bus + '_name'], cssIdentificator);
    });
  };

  insertBusInfo = function(lines, stopName, cssIdentificator) {
    var busStop, i, spans, _results;
    busStop = '#bus ' + cssIdentificator;
    spans = ['first', 'second', 'third'];
    $(busStop + ' .name').html(stopName);
    for (i in spans) {
      $(busStop + ' .' + spans[i] + ' .line').html('');
      $(busStop + ' .' + spans[i] + ' .time').html('');
    }
    if (typeof lines === 'string') {
      return $(busStop + ' .first .line').html('<div class="error">' + lines + '</div>');
    } else {
      if (lines['departures'].length === 0) {
        return $(busStop + ' .first .line').html('<div class="error">....zzzZZZzzz....</div>');
      } else {
        _results = [];
        for (i in spans) {
          $(busStop + ' .' + spans[i] + ' .line').append(lines['destination'][i]);
          _results.push($(busStop + ' .' + spans[i] + ' .time').append(lines['departures'][i]));
        }
        return _results;
      }
    }
  };

  updateNews = function() {
    var chosenAffiliation, feedItems;
    if (DEBUG) {
      console.log('updateNews');
    }
    feedItems = ls.feedItems;
    if (feedItems !== void 0) {
      return displayItems(JSON.parse(feedItems));
    } else {
      chosenAffiliation = ls.affiliationName;
      return $('#news').html('<div class="post"><div class="title">Nyheter</div><div class="item">Frakoblet fra ' + chosenAffiliation + '</div></div>');
    }
  };

  displayItems = function(items) {
    var feedName, idsOfLastViewed, index, link, mostRecent, newsList, updatedList, viewedList, _results;
    mostRecent = items[0].link;
    ls.mostRecentRead = mostRecent;
    $('#news').html('');
    feedName = items.feedName;
    viewedList = JSON.parse(ls.lastViewedIdList);
    newsList = JSON.parse(ls.mostRecentIdList);
    updatedList = findUpdatedPosts(viewedList, newsList);
    idsOfLastViewed = [];
    $.each(items, function(index, item) {
      var altLink, date, htmlItem, _ref;
      if (index < newsLimit) {
        idsOfLastViewed.push(item.link);
        htmlItem = '<div class="post"><div class="title">';
        if (index < ls.unreadCount) {
          if (_ref = item.link, __indexOf.call(updatedList.indexOf, _ref) >= 0) {
            htmlItem += '<span class="unread">UPDATED <b>::</b> </span>';
          } else {
            htmlItem += '<span class="unread">NEW <b>::</b> </span>';
          }
        }
        date = altLink = '';
        if (item.date !== null) {
          date = ' den ' + item.date;
        }
        if (item.altLink !== null) {
          altLink = ' name="' + item.altLink + '"';
        }
        htmlItem += item.title + '\
        </div>\
          <div class="item" data="' + item.link + '"' + altLink + '>\
            <img src="' + item.image + '" width="107" />\
            <div class="textwrapper">\
              <div class="emphasized">- Skrevet av ' + item.creator + date + '</div>\
              ' + item.description + '\
            </div>\
          </div>\
        </div>';
        console.log(htmlItem);
        return $('#news').append(htmlItem);
      }
    });
    ls.lastViewedIdList = JSON.stringify(idsOfLastViewed);
    Browser.setBadgeText('');
    ls.unreadCount = 0;
    $('.item').click(function() {
      Browser.openTab($(this).attr('data'));
      return window.close();
    });
    if (feedName === 'online') {
      _results = [];
      for (index in idsOfLastViewed) {
        link = idsOfLastViewed[index];
        _results.push(News.online_getImage(link, function(link, image) {
          var altLink;
          $('.item[data="' + link + '"] img').attr('src', image);
          altLink = $('.item[data="' + link + '"]').attr('name');
          if (altLink !== 'null') {
            return $('.item[data="' + link + '"]').attr('data', altLink);
          }
        }));
      }
      return _results;
    }
  };

  findUpdatedPosts = function(viewedList, newsList) {
    var news, updatedList, viewed, _i, _j, _len, _len1;
    updatedList = [];
    for (_i = 0, _len = viewedList.length; _i < _len; _i++) {
      viewed = viewedList[_i];
      for (_j = 0, _len1 = newsList.length; _j < _len1; _j++) {
        news = newsList[_j];
        if (viewedList[viewed] === newsList[news]) {
          updatedList.push(viewedList[viewed]);
        }
      }
    }
    return updatedList;
  };

  optionsText = function(show) {
    return fadeButtonText(show, 'Innstillinger');
  };

  chatterText = function(show) {
    return fadeButtonText(show, '&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; Bli med i samtalen');
  };

  fadeButtonText = function(show, msg) {
    var fadeInSpeed, fadeOutSpeed;
    fadeInSpeed = 150;
    fadeOutSpeed = 50;
    if (show) {
      $('#buttontext').html(msg);
      return $('#buttontext').fadeIn(fadeInSpeed);
    } else {
      $('#buttontext').fadeOut(fadeOutSpeed);
      return $('#buttontext').html('');
    }
  };

  $(function() {
    var affiliation, color, cssMap, logo;
    $.ajaxSetup({
      timeout: AJAX_TIMEOUT
    });
    if (ls.useInfoscreen === 'true') {
      Browser.openTab('infoscreen.html');
      setTimeout((function() {
        return window.close();
      }), 250);
    }
    if (ls.showOffice !== 'true') {
      $('#todays').hide();
    }
    if (ls.showCantina !== 'true') {
      $('#cantinas').hide();
    }
    if (ls.showBus !== 'true') {
      $('#bus').hide();
    }
    if (ls.affiliationName !== 'online') {
      affiliation = ls.affiliationName;
      logo = News.feeds[affiliation].logo;
      if (logo !== void 0 && logo !== '') {
        if (DEBUG) {
          console.log('Applying affiliation logo', logo);
        }
        $('#header #logo').prop('src', logo);
      }
    }
    color = ls['affiliationColor'];
    if (color !== 'undefined' && color !== '') {
      if (DEBUG) {
        console.log('Applying affiliation color', color);
      }
      cssMap = News.getColoringStyle(color);
      $('#background').css(cssMap);
    }
    $('#logo').click(function() {
      Browser.openTab(EXTENSION_WEBSITE);
      return window.close();
    });
    $('#options_button').click(function() {
      Browser.openTab('options.html');
      return window.close();
    });
    $('#chatter_button').click(function() {
      Browser.openTab('http://webchat.freenode.net/?channels=online');
      return window.close();
    });
    $('#options_button').mouseenter(function() {
      return optionsText(true);
    });
    $('#options_button').mouseleave(function() {
      return optionsText(false);
    });
    $('#chatter_button').mouseenter(function() {
      return chatterText(true);
    });
    $('#chatter_button').mouseleave(function() {
      return chatterText(false);
    });
    $('#bus #atb_logo').click(function() {
      Browser.openTab('http://www.atb.no');
      return window.close();
    });
    $(document).konami({
      code: ['up', 'up', 'down', 'down', 'left', 'right', 'left', 'right', 'b', 'a'],
      callback: function() {
        $('head').append('<style type="text/css">\
        @-webkit-keyframes adjustHue {\
          0% { -webkit-filter: hue-rotate(0deg); }\
          10% { -webkit-filter: hue-rotate(36deg); }\
          20% { -webkit-filter: hue-rotate(72deg); }\
          30% { -webkit-filter: hue-rotate(108deg); }\
          40% { -webkit-filter: hue-rotate(144deg); }\
          50% { -webkit-filter: hue-rotate(180deg); }\
          60% { -webkit-filter: hue-rotate(216deg); }\
          70% { -webkit-filter: hue-rotate(252deg); }\
          80% { -webkit-filter: hue-rotate(288deg); }\
          90% { -webkit-filter: hue-rotate(324deg); }\
          100% { -webkit-filter: hue-rotate(360deg); }\
        }</style>');
        return $('#background').attr('style', '-webkit-animation:adjustHue 10s alternate infinite;');
      }
    });
    return mainLoop();
  });

}).call(this);
