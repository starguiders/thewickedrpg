var members;
var membersLength;
var FC;
var base;

$(function() {

    // NORMALIZE FORUM URL
    if (INFOSLIST["URL"][INFOSLIST["URL"].length - 1] == '/')
        INFOSLIST["URL"] = INFOSLIST["URL"].slice(0, -1);

    // NORMALIZE LISTS GIVEN BY ADMINS
    for (var i = 0; i < INFOSLIST["utiles"].length; i++) {
        INFOSLIST["utiles"][i] = norm(INFOSLIST["utiles"][i]);
    }
    for (var i = 0; i < INFOSLIST["supprime"].length; i++) {
        INFOSLIST["supprime"][i] = norm(INFOSLIST["supprime"][i]);
    }
    for (var i = 0; i < INFOSLIST["contact"].length; i++) {
        INFOSLIST["contact"][i][0] = norm(INFOSLIST["contact"][i][0]);
    }

    // NORMALIZE NAMES GIVEN BY ADMINS
    INFOSLIST["grandeDescription"] = norm(INFOSLIST["grandeDescription"]);
    INFOSLIST["filtres"] = norm(INFOSLIST["filtres"]);
    members = setMembers();
    FC = $('#bp_fc');
    base = FC.find('.member_fc').eq(0).clone();
    setFaceclaim();
});





////////// STEP 0 : GLOBAL FUNCTIONS //////////

function norm(s) {
    return s.trim().toLowerCase();
}



////////// STEP 1 : GET URLS AND NAMES //////////

function setMembers() {
    var mbrs = {};
    var going = true;

    /*format the urls*/
    var URLpage = '/memberlist?mode=username&order=DESC';
    var URLstart = '&start=';
    var URLnumber = 0;
    var URLusername = '&username';
    var URL = INFOSLIST["URL"] + URLpage + URLusername;
    var going = true;
    var limit = 50;
    var l = 0;


    /*goes through the memberlist*/
    while (going) {
        var profiles = gip(URL, 'a[href^="/u"]');
        var c = 0;
        if (profiles.length == 0) going = false;
        else {

            for (var pseudo of profiles) {
                var hrf = $(pseudo).attr('href');
                if (mbrs[hrf] == undefined) {
                    mbrs[hrf] = {};
                    URLnumber += 1;
                }
            }

            URL = INFOSLIST["URL"] + URLpage + URLstart + URLnumber + URLusername;

            if (limit == 0) going = false;
            else limit--;
        }
    }
    membersLength = URLnumber;
    console.log(mbrs);
    console.log("members length : " + membersLength);
    return mbrs;
}

/*
    gets $(infoCSS) from the url page
*/
function gip(url, infoCSS) {
    var toreturn;
    $.ajax({
        url : url,
        type: 'GET',
        dataType: 'html',
        success : function(data) {
            toreturn = $(infoCSS, $(data))
        },
        async: false
    });
    return toreturn;
}





////////// STEP 1 : GET URLS AND NAMES //////////
function setFaceclaim() {
    for (var profile in members) {
        $.ajax({
            url : INFOSLIST["URL"] + profile,
            async: true,
            success: function(data) {
                var url = new URL(this.url);
                var profile = url.pathname;
                members[profile]["number"] = profile.match(/\d+/)[0];
                var rgx;


                //////////////////// INFOS LIST ////////////////////
                // find and stores alll small infos on the character
                var dataInfo = $(INFOSLIST["champUtile"], $(data));
                members[profile]["infos"] = {};
                members[profile]["contact"] = {};
                for (var info of dataInfo) {
                    var txt = norm($(info).text());

                    // VERIFIES IF SHOULD DELETE
                    rgx = new RegExp('^' + INFOSLIST['supprime'][0] + '\\s?\\*?' + INFOSLIST['separateurEfface'] + '(.+)');
                    var deleted = txt.match(rgx);
                    if (deleted != null) {
                        if (strip(deleted[1]) == strip(INFOSLIST['supprime'][1])) return;
                    }

                    // FINDS SMALL INFOS
                    for (var displayed of INFOSLIST["utiles"]) {
                        rgx = new RegExp('^' + displayed + '\\s?\\*?' + INFOSLIST['separateurEfface']);
                        if (txt.match(rgx) != null) {
                            members[profile]["infos"][displayed] = txt.replace(rgx, '');
                            break;
                        }
                    }

                    // FINDS CONTACT FIELDS
                    for (var contact of INFOSLIST["contact"]) {
                        var name = contact[0];
                        rgx = new RegExp('^' + name + '\\s?\\*?' + INFOSLIST['separateurEfface']);
                        if (txt.match(rgx) != null) {
                            members[profile]["contact"][name] = [txt.replace(rgx, ''), contact[1]];
                            break;
                        }
                    }

                    // finds and stores all the classes
                    rgx = new RegExp('^' + INFOSLIST['filtres'] + '\\s?\\*?' + INFOSLIST['separateurEfface']);
                    if (txt.match(rgx) != null) {
                        txt = txt.replace(rgx, '');
                        txt = txt.replace(/[\\\/\.\>\<\#\[\]\{\}]/gm, '');
                        members[profile]["filtres"] = txt;
                    }
                }


                //////////////////// OTHER INFOS ////////////////////

                // find and stores pseudo
                members[profile]["pseudo"] = $(INFOSLIST['pseudo'], $(data)).text();
                
                // find and stores rank
                members[profile]["rank"] = $(INFOSLIST['rank'], $(data)).text();
                
                // find and stores last visit
                members[profile]["lastvisit"] = $(INFOSLIST['lastvisit'], $(data)).text();

                // find and stores exp
                members[profile]["exp"] = $(INFOSLIST['exp'], $(data)).text();

                // find and stores age
                members[profile]["age"] = $(INFOSLIST['age'], $(data)).text();

                // find and stores occupation
                members[profile]["occup"] = $(INFOSLIST['occup'], $(data)).text();

                // find and stores face claim
                members[profile]["face"] = $(INFOSLIST['face'], $(data)).text();

                // find and stores localization
                members[profile]["local"] = $(INFOSLIST['local'], $(data)).text();
                
                // find and stores color
                members[profile]["color"] = $(INFOSLIST['pseudo'], $(data)).find('span').attr('style').split(';')[0].split('#')[1];

                // find and stores avatar url
                members[profile]["avatar"] = $(INFOSLIST['avatar'], $(data)).attr('src');

                // finds mp
                var mps = $('a[href^="/privmsg"]', $(data));
                members[profile]["mp"] = "/privmsg?mode=post&u=" + members[profile]["number"];
                
                // finds file
                members[profile]["file"] = $('.uphicons img[src*="contact_www"]', $(data)).parent('a').attr('href');
                
                // finds trunk
                members[profile]["trunk"] = $('.uphicons img[src*="/1/111"]', $(data)).parent('a').attr('href');

                // finds search
                members[profile]["search"] = $('.uphicons img[src*="/1/222"]', $(data)).parent('a').attr('href');

                //////////////////// CLONE ////////////////////
                var cloned = setCloned(base.clone(), profile);
                console.log("ajax call ok");
            }
        });
    }
}

function setCloned(cloned, profile) {
    // defines profile link
    cloned.find('a.profile_fc')
        .attr('href', (INFOSLIST["URL"] + profile))
        .attr('target', '_blank');
    // defines mp
    cloned.find('.mps_fc')
        .attr('href', INFOSLIST["URL"] + members[profile]["mp"])
        .attr('target', '_blank');
    // defines file
    if (members[profile]["file"] != undefined) {
    cloned.find('.file_fc')
        .attr('href', members[profile]["file"])
        .attr('target', '_blank');
    } else {
    cloned.find('.file_fc').remove();
    }
    // defines trunk
    if (members[profile]["trunk"] != undefined) {
    cloned.find('.trunk_fc')
        .attr('href', members[profile]["trunk"])
        .attr('target', '_blank');
    } else {
    cloned.find('.trunk_fc').remove();
    }
    // defines search
    if (members[profile]["search"] != undefined) {
    cloned.find('.search_fc')
        .attr('href', members[profile]["search"])
        .attr('target', '_blank');
    } else {
    cloned.find('.search_fc').remove();
    }

    // defines group colors
    cloned.attr('style', '--group:#'+members[profile]["color"]+';--group-50:#'+members[profile]["color"]+'80;--group-30:#'+members[profile]["color"]+'4D;--group-10:#'+members[profile]["color"]+'26;');

    // defines pseudo
    cloned.find('.name_fc').html(members[profile]["pseudo"]);
    
    // defines rank
    cloned.find('.rank_fc').text(members[profile]["rank"]);

    // defines exp
    cloned.find('.exp_fc em').text(members[profile]["exp"]);

    // defines age
    cloned.find('.age_fc em').text(members[profile]["age"]);

    // defines occupation
    cloned.find('.occupation_fc em').text(members[profile]["occup"]);

    // defines face claim
    cloned.find('.face_fc em').text(members[profile]["face"]);

    // defines localization
    cloned.find('.local_fc em').text(members[profile]["local"]);
    
    // defines last visit
    cloned.find('.lastcon_fc').html('<span>'+members[profile]["lastvisit"]+'</span>');
    
    // defines avatar
    cloned.find('.avatar_fc').attr('src', members[profile]["avatar"]);

    // defines (or untoggle) big description
    var hasDesc = (members[profile]["grandeDescription"] != undefined);
    if (hasDesc) {
        cloned.find('.infos_fc').html(members[profile]["grandeDescription"]);
    } else {
        cloned.find('.infos_fc').css('height', '0');
        cloned.find('.resume_fc').removeClass('no-extend');
    }

    // displays cloned and prepends it to main
    cloned.removeClass('none');

    // add inputbox a_name_fc
    cloned.find('.a_name_fc').eq(0).attr('name', tagName(members[profile]["pseudo"]));

    // add the filters
    cloned.addClass(members[profile]["filtres"]);

    FC.prepend(cloned);
    return cloned;
}