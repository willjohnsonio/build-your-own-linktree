# Build Your Own Linktree with Cloudflare Workers
If you're at a conference or meetup and want to share links so attendees can contact you later for questions. You could either ramble off a list of links and hope that everyone pulls out their phone, opens each app, then type in your username and then click follow. You could list all of your links on your slides, but that still requires work on the attendee's end. You could just share 1 of your links and have people connect with you there.

With all of these, you potentially lose out on making great connections in the community because there isn't a good way to share all the places you can be found online.

A better solution would be to create your own custom linktree with Cloudflare Workers. Real quick, a "linktree" is a link to a single page that has a vertical list of different sites that, when clicked, will take the visitor to those sites. You can have all of your online links in one place and share just one link, and people can quickly check you out all over the web.

## What Do You Need To Know
- JavaScript functions, objects, loops, and arrays.
- You also need to have npm insalled
- Sign up for a Cloudflare Workers account


## Install Wrangler and Configure Workers Project

To get started with a Cloudflare project, download and install the Cloudflare workers command line interface(CLI) called Wrangler. In your terminal, type `npm install -g @cloudflare/wrangler`.

Next, you need to link Wrangler with your Cloudflare account; to do that in your terminal, type `wrangler login` It'll ask if you want to open a page in your browser. Type Y for Yes.

That should open up a webpage that set's up an API token just for Wrangler. Click "Authorize Wrangler".

Now that you have wrangler installed and linked to your Workers account, you can create a new Workers project with wrangler. In your terminal type `wrangler generate cloudflare-linktree`. The generate command will create a new project and will name it cloudflare-linktree. You also have the option to add a URL of a GitHub repo to use as the starting point template for your project.

Once the project is created, open your code editor of choice, and inside of your `wrangler.toml` file, change the type to webpack. Add your account id that you can copy and paste from the terminal. If you can't find your account id, you can type `wrangler whoami` to find it as well.

**wrangler.toml**
```toml
name = "cloudflare-linktree"
type = "webpack"

account_id = "e7e5c8cde3ca89183f601cfb4b08d80f"
workers_dev = true
route = ""
zone_id = ""
```

## Create a JSON API For Your links
Go to the `index.js` file inside of your workers project. This is where you are going to write all the code for your Cloudflare worker. The first thing you need to do is create an array of objects with the link name and the URL as key value pairs.


**index.js**
```js
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

For the next part, you're going to use the open source project [itty-router](https://github.com/kwhitley/itty-router). It's a small router that works with Cloudflare workers.

In your terminal type, `npm install itty-router` after itty-router installs, go to `index.js` and at the top of the file type `import { Router } from 'itty-router'`(This is why you needed webpaack in your toml file). Then create a new variable called `router` and set it to `Router()` This creates a new instance of the router.

**index.js**
```js
`import { Router } from 'itty-router'

const router = Router()
Now you want to set up a router that leads to the path /links and return the array as JSON.

index.js

  router.get("/links", () => {
  const response = new Response(JSON.stringify(links), {
  headers: { 'content-type': 'application/json' },
 })

  return response
})

```

In the `get()` function, you passed the `/links` path, then passed a function that creates a new Response and stores links in a variable named `response` as a JSON string. Lastly, you passed in a headers object with the content type set to JSON.

Run `wrangler de`v in your terminal. This will create a connection between your localhost and the Cloudflare edge server for your worker. The URL defaults to `127.0.0.1:8787`. Visit `127.0.0.1:8787/links`. This will have the links you created showing as JSON.

## Display Your Links on an HTML Page

Now that you created your links you probably want to display them on a web page. For this tutorial, you'll use the template located at https://static-links-page.signalnerve.workers.dev. You'll start by making a fetch request to that URL and you'll get back an HTML page. You can change the content of the HTML using the [HTMLRewriter API](https://developers.cloudflare.com/workers/runtime-apis/html-rewriter)

HTMLRewriter is a class that lets you use JavaScript code to transform HTML. It has a lot of different methods we can use to change your HTML. Get started by creating a class called `LinkRewriter`. Inside the class, you add element handlers. Element handlers creates the changes to elements when using an `on()` function.

**index.js**
```js
class LinkRewriter {
  element(element) {
}
```
The element argument that you passed into the element handler represents the DOM element you want to change.

Now take your links array and use a `forEach()` loop to go through every item in the array. Inside the `forEach()`, you'll have a function where you name each item in the array `link` to represent the item when it being looped over.

Inside the function you'll add `element.append()`. Inside of `append()` pass in the HTML tag, in your case it will be an <a> tag.

**index.js**
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
  
With the HTMLRewriter class you added the URLs of every item in your array with template literal syntax`<a href="${link.url}" target="_blank">${link.name}</a>`.

You added `target="_blank"` so the links will open in a new page when clicked.

Finally, you added an options Object of `{ html: true `} so HTMLRewriter knows to treat the appended content as raw HTML.

Now you can call router with a `get()` method, pass in * which is called a wildcard route, meaning it will work for any route that isn't explicitly named. Next, pass an async function. The function creates a variable called HTMLResponse, await the response and fetches the HTML template.

**index.js**
```js
router.get("*", async () => {
  const htmlResponse = await fetch(
      "https://static-links-page.signalnerve.workers.dev",
  )

}
```
  
Next, create a response variable and assign it to a new instance of `HTMLRewriter()`. Add the `on()` function and pass in the the DOM element you want to target. In this example, you'll target the CSS id selector  `#links` that is already included in the HTML template. After that pass in `LinkRewriter()`. Lastly use the `transform()` function and pass in HTMLResponse and return response

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
  }
 ```
  
The final code you need to change to finish your linktree is the `addEventListner` function created in `index.js` when you generated a new workers project. Currently, it listens for any fetch event coming to your worker. You have an event object with the  respondsWith()   method call, and you pass it event.request. This lets your worker intercept the fetch request and respond with what you want.

**index.js**
  ```js
addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request))
})
  ```
In `addEventListner(`) replace `handleRequest` with `router.handle`. The `handle(`) method will return the first matching route handler that returns something (or nothing at all if no match).

**index.js**
```diff
addEventListener('fetch', event => {
 - event.respondWith(handleRequest(event.request))
 + event.respondWith(router.handle(event.request))
}) 
 ```
  
In your terminal type `wrangler dev` and visit the URL the command line creates for you which should be `127.0.0.1:8787`. If you all of your links show up, type CTRL + C to stop the server.

## Add Your Avatar and Your Name
  
The template you're using also has an avatar and a name that you can customize. To do that you create two more HTMLRewriters. The first one you'll create is AvatarRewriter. In this class, you'll use `element.setArttribute` to target the src HTML attribute for `<img>` tags and set it the URL of your avatar.

**index.js**
  ```js
class AvatarRewriter {
  element(element) {
      element.setAttribute("src", "https://avatars.githubusercontent.com/u/40403549?v=4")
  }
}
```

Next, create a NameRewriter and use `setInnerContent()` and pass in your name as a string.

**index.js**
```js
class NameRewriter {
  element(element) {
      element.setInnerContent("Will Johnson")
  }
}
```
  
Now, you need to add two `on()` functions that target the avatar and name CSS id selectors by passing them into the function. You also will pass in a new AvatarRewriter() and NameRewriter() to the on function.

**index.js**
```diff
router.get("*", async () => {
  const htmlResponse = await fetch(
      "https://static-links-page.signalnerve.workers.dev",
  )

 const response = new HTMLRewriter()
  .on("#links", new LinkRewriter())
 + .on("#avatar", new AvatarRewriter())
 + .on("#name", new NameRewriter())
  .transform(htmlResponse)

  return response
  }
```
  
In your terminal run `wrangeler dev` to make sure everything works. If everything is good type `wrangler publish` to deploy to your workers.dev subdomain. For example, mine is live at https://cloudflare-linktree.willjohnson.workers.dev/ and my JSON is API is https://cloudflare-linktree.willjohnson.workers.dev/links.

## Conclusion
  
Congrats! You downloaded wrangler, created a new workers project, used the HTMLRewriter API to write your own HTML, and added routing to your application. Now you have a linktree on your workers.dev subdomain with your favorite links to share the next time you are at a conference or meet up.
