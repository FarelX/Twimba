import { tweetsData } from "./data.js";
import { v4 as uuidv4 } from "https://jspm.dev/uuid";

document.addEventListener("click", function (e) {
  if (e.target.dataset.like) {
    handleLikeClick(e.target.dataset.like);
  } else if (e.target.dataset.retweet) {
    handleRetweetClick(e.target.dataset.retweet);
  } else if (e.target.dataset.reply) {
    handleReplyClick(e.target.dataset.reply);
  } else if (e.target.id === "tweet-btn") {
    handleTweetBtnClick();
  } else if (e.target.dataset.replyBtn) {
    handleReplyBtnClick(e.target.dataset.replyBtn);
  } else if (e.target.dataset.replyDelete) {
    handleDeleteReplyBtnClick(e.target.dataset.replyDelete);
  } else if (e.target.dataset.delete) {
    handleDeleteBtnClick(e.target.dataset.delete);
  }
});

function saveTweets() {
  localStorage.setItem("tweets", JSON.stringify(tweetsData));
}

function handleLikeClick(tweetId) {
  const targetTweetObj = tweetsData.filter(function (tweet) {
    return tweet.uuid === tweetId;
  })[0];

  if (targetTweetObj.isLiked) {
    targetTweetObj.likes--;
  } else {
    targetTweetObj.likes++;
  }
  targetTweetObj.isLiked = !targetTweetObj.isLiked;
  saveTweets();
  render();
}

function handleRetweetClick(tweetId) {
  const targetTweetObj = tweetsData.filter(function (tweet) {
    return tweet.uuid === tweetId;
  })[0];

  if (targetTweetObj.isRetweeted) {
    targetTweetObj.retweets--;
  } else {
    targetTweetObj.retweets++;
  }
  targetTweetObj.isRetweeted = !targetTweetObj.isRetweeted;
  saveTweets();
  render();
}

function handleReplyClick(replyId) {
  document.getElementById(`replies-${replyId}`).classList.toggle("hidden");
}

function handleTweetBtnClick() {
  const tweetInput = document.getElementById("tweet-input");

  if (tweetInput.value) {
    tweetsData.unshift({
      handle: `@Farel`,
      profilePic: `images/user-avatar.jpg`,
      likes: 0,
      retweets: 0,
      tweetText: tweetInput.value,
      replies: [],
      isLiked: false,
      isRetweeted: false,
      isOwner: true,
      uuid: uuidv4(),
    });
    saveTweets();
    render();
    tweetInput.value = "";
  }
}

function handleReplyBtnClick(btnId) {
  const replyInput = document.getElementById(btnId);
  if (replyInput.value) {
    const targetTweet = tweetsData.filter(function (tweet) {
      return tweet.uuid === btnId;
    })[0];
    targetTweet.replies.push({
      handle: `@Farel`,
      profilePic: `images/user-avatar.jpg`,
      tweetText: replyInput.value,
      uuid: uuidv4(),
      isOwner: true,
    });
  }
  saveTweets();
  render();
  document.getElementById(`replies-${btnId}`).classList.remove("hidden");
}

function handleDeleteReplyBtnClick(deleteId) {
  if (confirm("Apakah Anda yakin ingin menghapus tweet ini?")) {
    const targetTweet = tweetsData.filter(function (tweet) {
      return tweet.replies.some(function (reply) {
        return reply.uuid === deleteId;
      });
    })[0];
    const replyIndex = targetTweet.replies.findIndex(function (reply) {
      return reply.uuid === deleteId;
    });
    targetTweet.replies.splice(replyIndex, 1);
    saveTweets();
    render();
    document
      .getElementById(`replies-${targetTweet.uuid}`)
      .classList.remove("hidden");
  }
}

function handleDeleteBtnClick(deleteId) {
  if (confirm("Apakah Anda yakin ingin menghapus tweet ini?")) {
    const targetIndex = tweetsData.findIndex(function (index) {
      return index.uuid === deleteId;
    });
    tweetsData.splice(targetIndex, 1);
    saveTweets();
    render();
  }
}

function loadTweetsFromStorage() {
  const storedTweets = JSON.parse(localStorage.getItem("tweets"));
  if (storedTweets) {
    tweetsData.splice(0, tweetsData.length, ...storedTweets);
  }
}

function getFeedHtml() {
  let feedHtml = ``;

  tweetsData.forEach(function (tweet) {
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
                ${reply.isOwner ? `<i class="fa-solid fa-trash" data-reply-delete="${reply.uuid}"></i>` : ""}
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
                <span class ="tweet-detail">
                ${tweet.isOwner ? `<i class="fa-solid fa-trash" data-delete="${tweet.uuid}"></i>` : ""}
                </span>
            </div>   
        </div>  
       
    </div>
    <div class="hidden" id="replies-${tweet.uuid}">
        ${repliesHtml}
      <div class="tweet-reply">
        <div class="tweet-inner input">
        <img src="images/user-avatar.jpg" class="profile-pic">
            <div class="form__group field">
                <input type="text" class="form__field" placeholder="Post your reply" name="reply-${tweet.uuid}" id='${tweet.uuid}' data-reply-input="${tweet.uuid}" >
                <label for="${tweet.uuid}" class="form__label">Post your reply</label>
            </div>
            <button class="reply-btn" data-reply-btn="${tweet.uuid}">Reply</button>
        </div>
      </div>
    </div>
</div>
`;
  });
  return feedHtml;
}

function render() {
  document.getElementById("feed").innerHTML = getFeedHtml();
}
loadTweetsFromStorage();
render();
