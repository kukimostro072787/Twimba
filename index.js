import { tweetsData } from "./data.js";
import { v4 as uuidv4 } from "https://jspm.dev/uuid";

let ltweetsData = window.localStorage.getItem("Tweets");
let modal = document.getElementById("modal");
const signUpForm = document.getElementById("signup-form");
let users = [{}];

//EVENT LISTENERS
signUpForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const signupFormData = new FormData(signUpForm);
  const username = signupFormData.get("username");
  const password = signupFormData.get("password");
  const passwordConfirm = signupFormData.get("password-confirmation");

  //Check if password match
  if (password == passwordConfirm) {
    users[0] = {
      username: username,
      password: passwordConfirm,
    };
    window.localStorage.setItem("Users", JSON.stringify(users));
    modal.style.display = "none";
  } else {
    let modalError = document.getElementById("modal-error");
    modalError.innerHTML = "Passwords do not match";
    signUpForm.reset();
  }
});

document.addEventListener("click", function (e) {
  if (e.target.dataset.like) {
    handleLikeClick(e.target.dataset.like);
  } else if (e.target.dataset.retweet) {
    handleRetweetClick(e.target.dataset.retweet);
  } else if (e.target.dataset.reply) {
    handleReplyClick(e.target.dataset.reply);
  } else if (e.target.id === "tweet-btn") {
    handleTweetBtnClick();
  } else if (e.target.id === "reply-btn") {
    handleReplyBtnClick(e.target.dataset.replays);
  }
});

//FUNCTIONS

//This function launch the modal if there is not a user saved on local storage
function launchModal() {
  checkUser();
  if (checkUser() === false) {
    modal.style.display = "inline";
  } else {
    modal.style.display = "none";
  }
}

//This function checks in localstorage if there is a user saved from previous sessions
function checkUser() {
  if (window.localStorage.getItem("Users")) {
    return true;
  } else {
    return false;
  }
}

//This function gets the user objet from local storage
function getUser() {
  let getData = window.localStorage.getItem("Users");
  let user = JSON.parse(getData);
  return user;
}

//This function is in charge off adding or decrementing the like button of each tweet
function handleLikeClick(tweetId) {
  let ltweetsData = getLocal();
  const targetTweetObj = ltweetsData.filter(function (tweet) {
    return tweet.uuid === tweetId;
  })[0];

  if (targetTweetObj.isLiked) {
    targetTweetObj.likes--;
  } else {
    targetTweetObj.likes++;
  }
  targetTweetObj.isLiked = !targetTweetObj.isLiked;
  saveToLocal(ltweetsData);
  render();
}

//This function is in charge or adding or decrementing the retweet icon count
function handleRetweetClick(tweetId) {
  let ltweetsData = getLocal();
  const targetTweetObj = ltweetsData.filter(function (tweet) {
    return tweet.uuid === tweetId;
  })[0];

  if (targetTweetObj.isRetweeted) {
    targetTweetObj.retweets--;
  } else {
    targetTweetObj.retweets++;
  }
  targetTweetObj.isRetweeted = !targetTweetObj.isRetweeted;
  saveToLocal(ltweetsData);
  render();
}

//This function is in charge of hidding or showing the retweets in each tweet
function handleReplyClick(replyId) {
  document.getElementById(`replies-${replyId}`).classList.toggle("hidden");
}

//Function to create new tweets
function handleTweetBtnClick() {
  const tweetInput = document.getElementById("tweet-input");
  let user = getUser();

  if (tweetInput.value) {
    ltweetsData.unshift({
      handle: `@${user[0].username}`,
      profilePic: `images/scrimbalogo.png`,
      likes: 0,
      retweets: 0,
      tweetText: tweetInput.value,
      replies: [],
      isLiked: false,
      isRetweeted: false,
      uuid: uuidv4(),
    });
    saveToLocal(ltweetsData);
    render();
    tweetInput.value = "";
  }
}
//This function creates replys for a specific tweet
function handleReplyBtnClick(uuid) {
  let replayInput = document.getElementById("reply-input-" + uuid);
  let user = getUser();

  if (replayInput.value) {
    ltweetsData.forEach(function (tweet) {
      if (uuid == tweet.uuid) {
        tweet.replies.unshift({
          handle: `@${user[0].username}`,
          profilePic: `images/scrimbalogo.png`,
          tweetText: replayInput.value,
        });
      }
    });
    saveToLocal(ltweetsData);
    getFeedHtml();
    render();
    handleReplyClick(uuid);
    replayInput = "";
  }
}

/*This function complete the tweets section, in case there is no info stored in local storage
it uses the data inside data.js, but if there is info saved in localstorage it uses that info instead*/
function getFeedHtml() {
  if (checkLocal() === false) {
    saveToLocal(tweetsData);
  }

  ltweetsData = getLocal();
  let feedHtml = ``;

  ltweetsData.forEach(function (tweet) {
    let likeIconClass = "";

    if (tweet.isLiked) {
      likeIconClass = "liked";
    }

    let retweetIconClass = "";

    if (tweet.isRetweeted) {
      retweetIconClass = "retweeted";
    }

    let repliesHtml = "";

    if (tweet.replies.length > 0) {
      tweet.replies.forEach(function (reply) {
        repliesHtml += `
<div class="tweet-reply">
    <div class="tweet-inner">
        <img src="${reply.profilePic}" class="profile-pic">
            <div>
                <p class="handle">${reply.handle}</p>
                <p class="tweet-text">${reply.tweetText}</p>
            </div>
        </div>
</div>
`;
      });
    }

    feedHtml += `
<div class="tweet">
    <div class="tweet-inner">
        <img src="${tweet.profilePic}" class="profile-pic">
        <div>
            <p class="handle">${tweet.handle}</p>
            <p class="tweet-text">${tweet.tweetText}</p>
            <div class="tweet-details">
                <span class="tweet-detail">
                    <i class="fa-regular fa-comment-dots"
                    data-reply="${tweet.uuid}"
                    ></i>
                    ${tweet.replies.length}
                </span>
                <span class="tweet-detail">
                    <i class="fa-solid fa-heart ${likeIconClass}"
                    data-like="${tweet.uuid}"
                    ></i>
                    ${tweet.likes}
                </span>
                <span class="tweet-detail">
                    <i class="fa-solid fa-retweet ${retweetIconClass}"
                    data-retweet="${tweet.uuid}"
                    ></i>
                    ${tweet.retweets}
                </span>
            </div>   
        </div>             
    </div>
    <div class="reply-input-area">
        <img src="images/scrimbalogo.png" class="profile-pic">
        <textarea placeholder="Reply tweet" class="reply-textarea" id="reply-input-${tweet.uuid}"></textarea>
        <button id="reply-btn" data-replays="${tweet.uuid}">Reply</button>
    </div> 

    

    <div class="hidden" id="replies-${tweet.uuid}">
    ${repliesHtml}
    </div>   
</div>
`;
  });

  return feedHtml;
}
//This function checks if there is data stored on the Tweets Key inside localStorage
function checkLocal() {
  if (window.localStorage.getItem("Tweets")) {
    return true;
  } else {
    return false;
  }
}

/*This function saves an object of tweets into local storage, it is used when someone 
makes a tweet or a reply or at the begining when there´s no localstorage stored*/
function saveToLocal(tweets) {
  window.localStorage.setItem("Tweets", JSON.stringify(tweets));
}
//This function get´s the tweets object from local storage
function getLocal() {
  let getData = window.localStorage.getItem("Tweets");
  ltweetsData = JSON.parse(getData);
  return ltweetsData;
}

//This function paints whats inside "feed" div obtaining the return of getFeedHtml function
function render() {
  document.getElementById("feed").innerHTML = getFeedHtml();
}
launchModal();
render();
