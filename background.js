// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @filedescription Initializes the extension's background page.
 */

var nav = new NavigationCollector();
var currentTab = undefined;
var currentWindows;
var windowsOpened = new Map();
var windowsOpenedById = new Map();
var namespacesManaged =  new Map();
var urlManaged =  new Map();
var originsToManage = new Map();

var eventList = ['onBeforeNavigate'];
var namespaceTofind= "/namespaces/";

/*******************************
 *   WEB REQUESTS EVENTS    *
 *******************************/


chrome.webRequest.onBeforeRequest.addListener(function(details) {

    if (originsToManage.get(details.initiator)!=null) {
       
      const url = new URL(details.url);


      if (originsToManage.get(url.origin)!=null) {

            var namespace = filter(url,originsToManage.get(details.initiator));

            if (namespace != undefined && namespacesManaged.get(namespace) == null && namespace!='openshift-storage' && namespacesManaged.get(url)== null) {
              if (windowsOpened.get(namespace) == null) {
                    console.log('[create windows] '+details.url);
                    namespacesManaged.set(namespace,namespace);
                    urlManaged.set(url,url);
                    moveTabOfCurrentWindowsToNewWindows(currentTab,details.url,namespace);
              }                                     
            } else {

                if (namespace!=undefined && namespace!='openshift-storage' && namespacesManaged.get(url)== null) {
                  
                  
                    chrome.tabs.query({
                      active: true,              
                      lastFocusedWindow: true   
                    }, function(tabs) {
                      if (urlManaged.get(tabs[0].url)==null) {
                        console.log('[create tab] '+details.url);
                        moveTabOfCurrentWindowsToAnExistingWindows(windowsOpened.get(namespace),tabs[0].url,namespace);
                      }
                    });
                  
                }
            }  
      }  
    }

 }, {urls: ["<all_urls>"]});

function moveTabOfCurrentWindowsToNewWindows(tabIdToMove,url,namespace) {

  if (windowsOpened.get(namespace) == null) {
    chrome.tabs.query({
      active: true,
      lastFocusedWindow: true   
    }, function(tabs) {

      chrome.windows.create({ type: "normal"},function(window) {
 
        windowsOpened.set(namespace,window.id);
        windowsOpenedById.set(window.id,namespace);
        chrome.tabs.query({
          windowId: window.id
        }, function(tabsToClose) {
          // create      
          chrome.tabs.create( {
            url: tabs[0].pendingUrl==undefined?tabs[0].url:tabs[0].pendingUrl,
            //url: url,
            windowId: window.id
          },function(tabTocreate) {
          
            tabsToClose.forEach(function(t, idx) {
                chrome.tabs.remove(t.id);                      
            });
            
          } ) 
    
        });
      });
    });
  }
}


function moveTabOfCurrentWindowsToAnExistingWindows(mywindowsId,url,namespace) {
  
  if (urlManaged.get(url)==null) {
      urlManaged.set(url,url);
      chrome.tabs.query({
        windowId: mywindowsId
      }, function(tabsOfWindows) {
        var tabfounded = false;
        tabsOfWindows.forEach(function(t,idx) {
          if (t.url==url) {
            tabfounded = true;
          }                         
        })

        if (tabfounded==false) {
          
          chrome.tabs.create( {
            url: url,
            windowId: mywindowsId
          },function(tabTocreate) {
            
          } );
          
        }  
      });
      //groupTabs(mywindowsId,namespace);
  }
}

function groupTabs(mywindowsId,namespace) {
  
  chrome.tabs.query({
    windowId: mywindowsId
  }, function(tabsOfWindows) {
    var tabIds = Array.from(tabsOfWindows, x => x.id);
    console.log('tabIds = '+tabIds);
    console.log('groupement tabs of '+mywindowsId+ ' with key = ['+namespace+']');
    console.log(tabsOfWindows);
    tabsOfWindows.forEach(function(t,idx) {
      console.log('tabid = '+t.id) ;                   
    })
    chrome.tabs.group( {
        tabIds: tabIds
        //title: 'test'
    },function(groupcreated) {
        console.log('group created '+groupcreated);
    });
  });
}



function getCurrentWindowsID() {
  chrome.tabs.get(currentTab,function(myTab) {
      console.log('current windows ='+myTab.windowId);
      currentWindows = myTab.windowId;      
  })
}

function filter(url,myRule) {
  
  var poskeystart= myRule.requestRegex.indexOf('{}'); 
  
  var stringToresearch = myRule.requestRegex.substr(0,poskeystart)
   
  if (myRule.matchType=='contains') {
    var n = url.pathname.indexOf(stringToresearch);   
    if (n > -1 ) {
        var res = url.pathname.substr(n+stringToresearch.length); 
        var nres = res.indexOf('/');
        if (nres==-1) {
          var nres2 = res.indexOf('?');
          if (nres2==-1) {
            mykeyTab=res;
          } else {
            mykeyTab=res.substring(0,nres2);
          }
        } else {
          mykeyTab=res.substring(0,nres);          
        }
        return mykeyTab;    
    } 
  } else {

  }

}

chrome.windows.onRemoved.addListener(function(mywindow) {
  //console.log('Windows closed');
  chrome.tabs.query({
    windowId: mywindow.id
  }, function(mywindow) {
    mywindow.forEach(function(t,idx) {
      urlManaged.delete(t.url);
    });
  });
  if (windowsOpenedById.get(mywindow) !=null) {
    windowsOpened.delete(windowsOpenedById.get(mywindow));
    namespacesManaged.delete(windowsOpenedById.get(mywindow));
    windowsOpenedById.delete(mywindow);
    console.log('Windows '+mywindow+' closed and cache cleared');
  }
})


chrome.tabs.onActivated.addListener(function(mytab, callback) {
  //console.log('tab actived : '+mytab.tabId);
  currentTab = mytab.tabId;
  getCurrentWindowsID();
})

chrome.tabs.onCreated.addListener(function(mytab) {
  //console.log('tab created : '+mytab.tabId);
})

// Reset the navigation state on startup. We only want to collect data within a
// session.
chrome.runtime.onStartup.addListener(function() {
  console.log("started.");
  windowsOpened = new Map();
  windowsOpenedById = new Map();

  nav.resetDataStorage();
});



chrome.runtime.onInstalled.addListener(function(details){
  console.log("onInstalled.");
  windowsOpened = new Map();
  windowsOpenedById = new Map();
  namespacesManaged = new Map();
  urlManaged = new Map();
  console.log("windows id cache cleared");
});


chrome.runtime.onMessage.addListener(function(payload, callback) {
  originsToManage = new Map();
  payload.payload.requestoverrideRules.forEach(function(requestoverrideRule) {
    console.log('id: '+requestoverrideRule.id);
    console.log('actived: '+requestoverrideRule.actived);
    console.log('matchType: '+requestoverrideRule.matchType);
    console.log('origin: '+requestoverrideRule.origin);
    console.log('requestRegex: '+requestoverrideRule.requestRegex);
    console.log('-----------------------------------------------------------');
    originsToManage.set(requestoverrideRule.origin,requestoverrideRule);
  });
 

});



