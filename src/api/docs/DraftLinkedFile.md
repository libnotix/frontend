
# DraftLinkedFile


## Properties

Name | Type
------------ | -------------
`fileId` | number
`filename` | string
`sizeBytes` | number
`mimeType` | string
`contextStatus` | string
`contextMode` | string
`statusMessage` | string

## Example

```typescript
import type { DraftLinkedFile } from ''

// TODO: Update the object below with actual values
const example = {
  "fileId": null,
  "filename": null,
  "sizeBytes": null,
  "mimeType": null,
  "contextStatus": null,
  "contextMode": null,
  "statusMessage": null,
} satisfies DraftLinkedFile

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as DraftLinkedFile
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


