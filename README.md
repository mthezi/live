### Editor

```tsx
 <Editor
  apiKey={process.env.NEXT_PUBLIC_TINY_MCE_API_KEY}
  onInit={(evt, editor) => {
    // @ts-ignore
    editorRef.current = editor
  }}
  initialValue=''
  init={{
    language: 'zh_CN',
    height: 350,
    menubar: false,
    plugins: [
      'advlist',
      'autolink',
      'lists',
      'link',
      'image',
      'charmap',
      'preview',
      'anchor',
      'searchreplace',
      'visualblocks',
      'codesample',
      'fullscreen',
      'insertdatetime',
      'media',
      'table',
      'code',
      'help',
      'wordcount',
    ],
    toolbar:
      'undo redo | blocks | ' +
      'codesample | bold italic forecolor | alignleft aligncenter ' +
      'alignright alignjustify | bullist numlist outdent indent | ' +
      'removeformat | help',
    content_style:
      'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
  }}
/>
```
