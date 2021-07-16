# Build Your Own Linktree with Cloudflare Workers

If you just gave a conference or meetup talk and want to share links so attendees can contact you later for questions. You could either ramble off a list of links, and hope that everyone pulls out there phone, opens each app, then type in your username and then click follow. You could list all of your links on your slides but that still requires work on the attendees end. You could just share 1 one of your links and have people connect with you there. 

With all of these you potenitally lose out on making great connections in the community because there isn't a good way to share wall the places you can be found online.

A better solution would be to create your own custom linktree with Cloudflare Workers. Real quick, a "linktree" is a link to a single page that has a vertical list of different sites that when clicked will take the vistor to that site. You can have all of your online links in one place and share just one link and people can easily check youy out all over the web

## What Do You Need To Know

- Comfortable with JavaScript functions, objects, and arrays you will be able to follow along in this tutorial. 
- You also have need to have [npm insalled](https://docs.npmjs.com/getting-started)
- sign up for a [Cloudflare Workers account](https://workers.cloudflare.com/)

## Install Wrangler and configure workers project

To get started with a Cloudflare project download and install the Cloudflare workers command line interface(CLI) called Wrangler. In your terminal type `npm install -g @cloudflare/wrangler`

Next you need to link Wrangler with your Cloudflare account to do that in your terminal type `wrangler login` It'll ask if I want to open a page in your browser. Type Y for Yes.

That should open up a webpage that set's up an API token just for Wrangler. Click Authorize Wrangler. 

Now that you have wrangler installed and linked to your workrers account you can create a new workers project with wrangler in your terminal type `wrangler generate cloudflare-linktree` The `generate` commmand will create a new project and will name it `cloudflare-linktree`. You also have the option add a URL of a [GitHub repo](https://developers.cloudflare.com/workers/get-started/quickstarts) to use as the starteing point template for your project.

Once the project is created open your code editor of choice and inside of your `wrangler.toml` file change the `type` to webpack add your account id that you can copy and paste from the the terminal. If you can't find your account id, you can type `wrangler whoami` to find it as well.

**wrangler.toml**
```toml
name = "cloudflare-linktree"
type = "webpack"

account_id = "e7e5c8cde3ca89183f601cfb4b08d80f"
workers_dev = true
route = ""
zone_id = ""
```

## Create Links to Display Them on HTML Page

Go to the `index.js` file inside of your workers project. This is where you are going to write the code for your Cloudflare worker. The first thing you would need t o do is create an array of objects with the link name and the url as key value pairs.


**index.js**
```
const links = [
  {
    "name": "Twitter",
    "url": "https://twitter.com/willjohnsonio",
  },
  {
    "name": "LinkedIn",
    "url": "https://www.linkedin.com/in/willjohnsonio/",
    ,
  {
    "name": "Twitch",
    "url": "https://www.twitch.tv/willjohnsonio",
   }
```

Now that you created your links your probaly want to display them to a web page. For this tutorial you'll use a template that localed at `https://static-links-page.signalnerve.workers.dev`. You'll start by making a `fetch` request to that URL and you'll get back and HTML pge. You can change the content of the HTML using the [HTMLRewriter API](https://developers.cloudflare.com/workers/runtime-apis/html-rewriter)

HTMLRewriter is a class that lets using JavaScript code to transform HTML. It has has a lot of different methods we can use to change your HTML. Lets started by creating a class called `LinkRewriter`. Inside of the class you add element handlers. Element handlers response to incoming elements when using an `.on` function(will get into the functions later in this post).

```js
class LinkRewriter {
  element(element) {
  
}

```

The element argument that passed into the element handler is a stand in of the DOM element you want to change. Now take your links array and use a `.forEach()` loops to go thorugh every item in the array. Inside of the forEach you'll have a callback function where you name each item in the array the name link to respresent inside of this function. 

Inside the function you'll add element.append() inside of that method pass in the HTML tag in your case it will be an `<a>` tag.

```js
class LinkRewriter {
  element(element) {
      links.forEach(link => {
          element.append(
              `<a href="${link.url}" target="_blank">${link.name}</a>`,
              {
                  html: true,
              }
              
          )
      },
      )
  }
}
```

With the HTMLRewriter class you added URLs of every item in your array with template literal syntax`<a href="${link.url}" target="_blank">${link.name}</a>`,. 

You added `target="_blank"` so the links when open in a new page when clicked. 

Finally, you added an Options Object of `{ html: true }` so HTMLReWriter knows to treat the appended content as raw HTML. 

For the the next part you're going to use an open source project called [itty-router](https://github.com/kwhitley/itty-router) it's a small router that works with Cloudflare workers.


## Add Routing to Your Clouddlare worker

In your terminal type `npm install itty-router` after itty-router installs go to `index.js` and at the top of the file type `import { Router } from 'itty-router'
`. Then create a new variable called router and set it to `Router()` This creates a router.


```js
import { Router } from "itty-router"
.....

class LinkRewriter {
  element(element) {
      links.forEach(link => {
          element.append(
              `<a href="${link.url}" target="_blank">${link.name}</a>`,
              {
                  html: true,
              }
              
          )
      },
      )
  }
}

const router = Router()
```

Now you can use the router to tell your application where to go. Call `router` with a `get()` method, pass in * which is called a wildcard route meaning it will work for any router that isn't expicityly named. Next pass a async calledback function. In the callback function created a veriable called `HTMLResponse`, `await` the response by fetching HTMl template you read about earlier.

**index.js**
```js
router.get("*", async () => {
  const htmlResponse = await fetch(
      "https://static-links-page.signalnerve.workers.dev",
  )

}
```

Next create a varible called response and assign it to a new instance of `HTMLRewriter()`. Add the `.on()` funcrion and pass in the tet DOM element you want to target. In this example you'll be target the CSS id selector `#links` that's already included in the HTML template. After that pass in `LinkRewriter()`. Lastly use the `transform()` function and pass in `HTMLResponse` and return `response`


**index.js**
```js
router.get("*", async () => {
  const htmlResponse = await fetch(
      "https://static-links-page.signalnerve.workers.dev",
  )

  const response = new HTMLRewriter()
  .on("#links", new LinkRewriter())
  .transform(htmlResponse)

  return response
```

The final codee you need to change to finish your linktree is the `addEventListner` function that is created  in `index.js` when you generate a new workers project. Currently it listen for any `fetch` event coming to your worker. You have an event object that has the `responsWith()` method call and you pass it `event.request`. This let your worker intercept the fetch request and response with what you want.


**index.js**
```js
addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request))
})
 ```
 
 In `addEventListner()` replace `handleRequest` with `router.handle.` The `handle()` method will return the first matching route handler that returns something (or nothing at all if no match).
 
 
 **index.js**
 ```js
 addEventListener('fetch', event => {
  event.respondWith(router.handle(event.request))
})
 ```
In your terminal type `wrangler dev` and visit the URL the command line creates for you. If you all of your links are showing up type CTRL + C to steop the server and then type `wrangler publish` in your terminal to deploy to your workers.dev subdomain.

## Conclusion

Congrats! You downloaded wrangler, created a new workers project, used the HTMLRewriter API to write your won HTML, and add routing to your application. Now you have a linktree on your workers.dev subdomain with your favorite links to share the next time your at a conference or meet up.
