# Mongez React Helmet

A React component to manage web page metadata.

## Before moving on

This package is fully dependant on [Mongez Dom](https://github.com/hassanzohdy/mongez-dom), so defining any values such as `title` `description` `image` will generate the same dom elements as it uses **Mongez Dom** under the hood.

## Installation

`yarn add @mongez/react-helmet`

Or

`npm i @mongez/react-helmet`

## Usage

First off, let's define our helmet configurations so we can use it later without setting it every time.

### Setting Helmet Configurations

In some earlier point in your app, create a `src/config/helmet.ts` file and put the following code inside it, then import it in your `src/index.ts`, javascript files are allowed also (But not recommended).

```js
import { setHelmetConfigurations } from '@mongez/cache';

setHelmetConfigurations({
  appName: 'My Online Store',
  appendAppName: true,
  appNameSeparator: ' | ',
});
```

### Helmet Configurations List

Here is the entire configurations list that can be used with `setHelmetConfigurations`

```ts
type HelmetConfigurations = {
  /**
   * Define the app name, needed when appendAppName is set to true
   */
  appName?: string;
  /**
   * Append app name beside the title
   *
   * @default true
   */
  appendAppName?: boolean;
  /**
   * Defines the separator between the page title and app name
   * This will be used only if the `appendAppName` is set to true
   *
   * @default " | "
   */
  appNameSeparator?: string;
  /**
   * Allow adding url meta tags automatically in the head tag
   *
   * @default true
   */
  url?: boolean;
  /**
   * Sets Html attributes list to html tag
   */
  htmlAttributes?: Object;
  /**
   * Define page class name
   */
  className?: string;
};
```

## Using Helmet Component

Now we're ready, let's use our `Helmet` component in our pages, go to your `HomePage` component file.

```tsx
import { Helmet } from '@mongez/react-helmet';

export default function HomePage() {
  return (
    <>
    <Helmet appendAppName={false} title="My Online Store" description="Short description about my store" keywords={['online', 'store', 'electronics']} />
      // rest of the code
    </>
  )
}
```

Here we set our title, and disabled appending the app name as it will be probably the same as the home page title, and added meta description and some keywords as well.

Let's try our blog post page

```tsx
import React from 'react';
import getPost from './../services/getPost';
import { Helmet } from '@mongez/react-helmet';

export default function BlogPostPage(id) {
  const [post, setPost] = React.useState(null);

  React.useEffect(() => {
    getPost(id).then(response => {
      setPost(response.data.post);
    })
  }, []);

  if (! post) return <h1>Loading...</h1>;

  return (
    <>
    <Helmet title={post.title} description={post.shortDescription} keywords={post.keywords} image={post.image} />
      // rest of the code
    </>
  )
}
```

Here is the entire props list for `Helmet` Component

```ts
type HelmetProps = {
  /**
   * HTML Page Title
   * This will set the og:title, twitter:title and itemprop name
   */
  title: string;
  /**
   * Define the app name, needed when appendAppName is set to true
   */
  appName?: string;
  /**
   * Append app name beside the title
   *
   * @default true
   */
  appendAppName?: boolean;
  /**
   * Defines the separator between the page title and app name
   * This will be used only if the `appendAppName` is set to true
   *
   * @default " | "
   */
  appNameSeparator?: string;
  /**
   * Page meta Description
   */
  description?: string;
  /**
   * Page meta keywords
   * If passed as string, then separate each keyword with comma `,`.
   */
  keywords?: string | string[];
  /**
   * Page image
   */
  image?: string;
  /**
   * Defines page url
   * This can be changed from helmet configurations
   * If set to true, then the current url will be grabbed directly.
   *
   * @default true
   */
  url?: boolean | string;
  /**
   * Sets Html attributes list to html tag
   */
  htmlAttributes?: Object;
  /**
   * Defines Page id
   */
  pageId?: string;
  /**
   * Define page class name
   */
  className?: string;
};
```

Please note that only `title` prop is the only required prop for this component.

## TODO

- Add Unit Tests.
