## @rappopo/cuk-rest

### Route File

```javascript
module.exports = function(cuk) {
  ...
  return {
    column: ['col1', 'col2'],                      // optional, global columns
    middleware: 'root:globalMiddleware',           // optional, global middleware
    param: {                                       // optional, global parameter handler
      globalParam: (globalParam, ctx, next) => {
        ...
        return next()
      },
      ...
    },
    method: {
      find: {
        column: ['col1', 'col2'],                  // optional, overwrite global columns here
        middleware: 'root:routeMiddleware',        // optional, additional middleware
        path: '/my/custom/route/path.:ext',        // optional, custom route path
        param: {                                   // optional, parameter handler local to this method
          routeParam: (routeParam, ctx, next) => {
            ...
            return next()
          }
          ...
        },
        handler: async (ctx, next) => {
          ...
          return {
            success: true,
            data: [
              {
                id: 1,
                name: 'name 1',
                ...
              },
              ...
            ]
          }
        }
      },
      create: {
        ...
      },
      ...
    }
  }
}
```

### Supported Methods

| Method | HTTP Verb | Path |
| ------ | --------- | ---- |
| find | GET | /api/my/resource.json |
| findOne | GET | /api/my/resource/uniqid.json |
| findOneSelf | GET | /api/my/resource.json |
| create | POST | /api/my/resource.json |
| update | PUT | /api/my/resource/uniqid.json |
| updateSelf | PUT | /api/my/resource.json |
| remove | DELETE | /api/my/resource/uniqid.json |

Pay attention to ```findOneSelf``` and ```updateSelf```. Since these methods don't expose ```uniqid``` parameter, your routes need to find a way to get those ids (e.g.: using ```ctx.state.uniqid``` or query string)

## Links

* [Documentation](https://docs.rappopo.com/cuk-rest/)
* [Changelog](CHANGELOG.md)
* Donation: Bitcoin **16HVCkdaNMvw3YdBYGHbtt3K5bmpRmH74Y**

## License

[MIT](LICENSE.md)
