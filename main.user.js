// ==UserScript==
// @name         ScoreSaber Rank Request Add-ons
// @namespace    https://scoresaber.com/ranking/requests
// @version      2.0.0
// @description  Simple features for ScoreSaber ranking
// @author       Dylan Nicastro
// @match        https://scoresaber.com/*
// @updateURL    https://github.com/dylanNicastro/ss-ranking-addon/raw/master/main.user.js
// @downloadURL  https://github.com/dylanNicastro/ss-ranking-addon/raw/master/main.user.js
// @icon         https://scoresaber.com/images/logo.svg
// @grant        none
// @require      https://code.jquery.com/jquery-3.7.1.min.js
// ==/UserScript==

(function() {
    'use strict';
    let isOnRequestsPage = false;
    let downvotesHidden = false;

    function addHideButton() {
        if ($(".downvote-toggle").length === 0) {
            $(".section").append('<button class="downvote-toggle button is-small svelte-15752pe"><span class="icon"><i class="fas fa-list svelte-15752pe"></i></span> <span>Toggle Downvoted Maps</span></button>');
            $(".downvote-toggle").on('click', toggleDownvoted);
        }
    }

    function modifyRequests() {
        $(".table-item").each(function() {
            if ($(this).find(".status-message").length === 0) {
                let rtUpvotes = parseInt($(this).find(".rt_upvotes").text());
                let difficultyCount = parseInt($(this).find(".diffs_created_at b").first().text());
                let required = 3 - Math.floor(rtUpvotes/difficultyCount);
                let msg = required === 0 ? "<b>No votes required! Ready for qualification!</b>" : `${required} RT member${required === 1 ? "" : "s"} required`;
                $(this).find(".song-info").append(`<p class='status-message'>${msg}</p>`);
            }
        });
    }

    function toggleDownvoted() {
        $(".table-item").each(function() {
            if (parseInt($(this).find(".rt_downvotes").text()) > 0 ||
                parseInt($(this).find(".qat_downvotes").text()) > 0) {
                if (downvotesHidden) $(this).show();
                else $(this).hide();
            }
        });
        downvotesHidden = !downvotesHidden;
    }

    function checkDownvotedAreHidden() {
        if (!downvotesHidden) return;
        $(".table-item").each(function() {
            if (parseInt($(this).find(".rt_downvotes").text()) > 0 ||
                parseInt($(this).find(".qat_downvotes").text()) > 0) {
                $(this).hide();
            }
        });
    }

    async function modifyCounter() {
        $.get("https://scoresaber.com/api/leaderboards?qualified=true&unique=true", function(res) {
            $(".level-item").eq(1).find(".heading").text("Qualified Maps");
            $(".level-item").eq(1).find(".title").text(res.leaderboards.length);
        });
    }

    function initializeRequestsPage() {
        if (window.requestsInterval) {
            clearInterval(window.requestsInterval);
        }

        window.requestsInterval = setInterval(() => {
            let items = $(".table-item");
            if (items.length > 0) {
                modifyRequests();
                addHideButton();
                checkDownvotedAreHidden();
                modifyCounter();
            }
        }, 500);
    }

    // Thank you Claude AI for writing this part
    function checkCurrentPage() {
        const isRequestPage = window.location.pathname === '/ranking/requests';

        if (isRequestPage && !isOnRequestsPage) {
            isOnRequestsPage = true;
            initializeRequestsPage();
        } else if (!isRequestPage && isOnRequestsPage) {
            isOnRequestsPage = false;
            if (window.requestsInterval) {
                clearInterval(window.requestsInterval);
            }
        }
    }
    const observer = new MutationObserver(() => {
        checkCurrentPage();
    });
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    checkCurrentPage();
})();