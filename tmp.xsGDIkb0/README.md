> We are under construction&hellip;

# Progressive Web Apps HQ
Progressive Web Apps HQ summarizes the set of features that Progressive Web Apps exhibit on modern platforms at the same time it enumerates the technologies supporting these features while keeping a list of resources to ease the development and growth of Progressive Web Applications.

This is not a discussion site, nor a proposal hub but a meeting point for those developing Progressive Web Applications with up-to-date and accurate information reflecting the state of the art.

## How to contribute?
Progressive Web Apps is a collaborative Jekyll web site using [collections](http://jekyllrb.com/docs/collections/). You can contribute by adding new items to collections or modifying existing information. In any case, simply send a pull request.

### Resources
The easiest way of contributing is by adding a resource. If your resource is about one feature, add a resource entry to the feature document inside the `_features` folder. If it is related with a technology, do the same with the proper entry inside `_technologies` folder. The format of a resource entry is as follows:
  * `type`: currently one of `doc`, `demo` or `tool`. Documentation and tutorials should be tagged `doc`; live demoes / examples should be categorized `demo` and framework or libraries should be considered of type `tool`.
  * `name`: the name of the resource.
  * `url`: its URL.
  * `description`: a brief description of the resource.

### Features
[Features](https://github.com/mozilla/progressive-apps-hq/tree/gh-pages/_features) is one of the HQ collections. They are characteristics of progressive web applications with specific use cases. Currently most of them are motivated by existing native applications use cases. If you want to add a new feature, be sure you have use cases supporting it and technologies that allow it to be implement. In other words, please don't use the collection to propose new features.

The format of a feature is as follows:
  * `content`: is the long explanation for the feature.
  * `title`: is the name of the feature.
  * `slug`: is the _id-friendly_ name for the feature. It's used as the CSS class for the icon.
  * `description`: is the short description shown at `index.html`.
  * `usecases`: is the list of use cases.
  * `technologies`: is the list of technologies used to realize the feature. Use the `slug` representation when listing technologies.
  * `resources`: list of [resources](#resources) related with the feature.

### Technologies
[Technologies](https://github.com/mozilla/progressive-apps-hq/tree/gh-pages/_technologies) is the other of the HQ main collections. They are the set of APIs, protocols, standards and techniques implementing features. This is not the place for ellaborated documentation, if you have published a tutorial or a blog post about a technology, it is a resource related with that technology. If you feel some technology is missed, add a new item to the collection but be sure your technology supports at least one feature.

The metadata for technologies includes:
  * `content`: is the long explanation for the technology.
  * `title`: is the name of the technology.
  * `slug`: is the _id-friendly_ name for the technology. It's used inside [features](#features) front matter to set the relationship between features and technologies.
  * `description`: is the short description shown at `index.html`.
  * `status`: is the URL for the specific [platform status]() section for the technology.
  * `spec`: is the URL for the official specification of that technology.
  * `resources`: list of [resources](#resources) related with the feature.
  
## Is the HQ a Progressive App?
Nope&hellip; yet.
