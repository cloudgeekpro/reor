from transformers import AutoTokenizer
import time


def test_tokenizer(tokenizer, text):
    start_time = time.time()
    tokens = tokenizer.encode(text, return_tensors="pt")
    end_time = time.time()

    decoded_text = tokenizer.decode(tokens[0])

    print(f"Time taken to tokenize: {end_time - start_time} seconds")
    print(f"Number of tokens: {len(tokens[0])}")
    print(f"Tokens are: {tokens}")
    print("Decoded Text:")
    print(decoded_text)


# Load the tokenizer
tokenizer = AutoTokenizer.from_pretrained("Xenova/all-MiniLM-L6-v2")
try:
    test_tokenizer(
        tokenizer,
        "VGhlIFNwYW5pc2ggQ2l2aWwgV2FyIChTcGFuaXNoOiBHdWVycmEgQ2l2aWwgRXNwYcOxb2xhKVtub3RlIDJdIHdhcyBmb3VnaHQgZnJvbSAxOTM2IHRvIDE5MzkgYmV0d2VlbiB0aGUgUmVwdWJsaWNhbnMgYW5kIHRoZSBOYXRpb25hbGlzdHMuIFJlcHVibGljYW5zIHdlcmUgbG95YWwgdG8gdGhlIGxlZnQtbGVhbmluZyBQb3B1bGFyIEZyb250IGdvdmVybm1lbnQgb2YgdGhlIFNlY29uZCBTcGFuaXNoIFJlcHVibGljLCBhbmQgY29uc2lzdGVkIG9mIHZhcmlvdXMgc29jaWFsaXN0LCBjb21tdW5pc3QsIHNlcGFyYXRpc3QsIGFuYXJjaGlzdCwgYW5kIHJlcHVibGljYW4gcGFydGllcywgc29tZSBvZiB3aGljaCBoYWQgb3Bwb3NlZCB0aGUgZ292ZXJubWVudCBpbiB0aGUgcHJlLXdhciBwZXJpb2QuWzEyXSBUaGUgb3Bwb3NpbmcgTmF0aW9uYWxpc3RzIHdlcmUgYW4gYWxsaWFuY2Ugb2YgRmFsYW5naXN0cywgbW9uYXJjaGlzdHMsIGNvbnNlcnZhdGl2ZXMsIGFuZCB0cmFkaXRpb25hbGlzdHMgbGVkIGJ5IGEgbWlsaXRhcnkganVudGEgYW1vbmcgd2hvbSBHZW5lcmFsIEZyYW5jaXNjbyBGcmFuY28gcXVpY2tseSBhY2hpZXZlZCBhIHByZXBvbmRlcmFudCByb2xlLiBEdWUgdG8gdGhlIGludGVybmF0aW9uYWwgcG9saXRpY2FsIGNsaW1hdGUgYXQgdGhlIHRpbWUsIHRoZSB3YXIgaGFkIG1hbnkgZmFjZXRzIGFuZCB3YXMgdmFyaW91c2x5IHZpZXdlZCBhcyBjbGFzcyBzdHJ1Z2dsZSwgYSByZWxpZ2lvdXMgc3RydWdnbGUsIGEgc3RydWdnbGUgYmV0d2VlbiBkaWN0YXRvcnNoaXAgYW5kIHJlcHVibGljYW4gZGVtb2NyYWN5LCBiZXR3ZWVuIHJldm9sdXRpb24gYW5kIGNvdW50ZXJyZXZvbHV0aW9uLCBhbmQgYmV0d2VlbiBmYXNjaXNtIGFuZCBjb21tdW5pc20uWzEzXSBBY2NvcmRpbmcgdG8gQ2xhdWRlIEJvd2VycywgVS5TLiBhbWJhc3NhZG9yIHRvIFNwYWluIGR1cmluZyB0aGUgd2FyLCBpdCB3YXMgdGhlICJkcmVzcyByZWhlYXJzYWwiIGZvciBXb3JsZCBXYXIgSUkuWzE0XSBUaGUgTmF0aW9uYWxpc3RzIHdvbiB0aGUgd2FyLCB3aGljaCBlbmRlZCBpbiBlYXJseSAxOTM5LCBhbmQgcnVsZWQgU3BhaW4gdW50aWwgRnJhbmNvJ3MgZGVhdGggaW4gTm92ZW1iZXIgMTk3NS4KClRoZSB3YXIgYmVnYW4gYWZ0ZXIgdGhlIHBhcnRpYWwgZmFpbHVyZSBvZiB0aGUgY291cCBkJ8OpdGF0IG9mIEp1bHkgMTkzNiBhZ2FpbnN0IHRoZSBSZXB1YmxpY2FuIGdvdmVybm1lbnQgYnkgYSBncm91cCBvZiBnZW5lcmFscyBvZiB0aGUgU3BhbmlzaCBSZXB1YmxpY2FuIEFybWVkIEZvcmNlcywgd2l0aCBHZW5lcmFsIEVtaWxpbyBNb2xhIGFzIHRoZSBwcmltYXJ5IHBsYW5uZXIgYW5kIGxlYWRlciBhbmQgaGF2aW5nIEdlbmVyYWwgSm9zw6kgU2FuanVyam8gYXMgYSBmaWd1cmVoZWFkLiBUaGUgZ292ZXJubWVudCBhdCB0aGUgdGltZSB3YXMgYSBjb2FsaXRpb24gb2YgUmVwdWJsaWNhbnMsIHN1cHBvcnRlZCBpbiB0aGUgQ29ydGVzIGJ5IGNvbW11bmlzdCBhbmQgc29jaWFsaXN0IHBhcnRpZXMsIHVuZGVyIHRoZSBsZWFkZXJzaGlwIG9mIGNlbnRyZS1sZWZ0IFByZXNpZGVudCBNYW51ZWwgQXphw7FhLlsxNV1bMTZdIFRoZSBOYXRpb25hbGlzdCBmYWN0aW9uIHdhcyBzdXBwb3J0ZWQgYnkgYSBudW1iZXIgb2YgY29uc2VydmF0aXZlIGdyb3VwcywgaW5jbHVkaW5nIENFREEsIG1vbmFyY2hpc3RzLCBpbmNsdWRpbmcgYm90aCB0aGUgb3Bwb3NpbmcgQWxmb25zaXN0cyBhbmQgdGhlIHJlbGlnaW91cyBjb25zZXJ2YXRpdmUgQ2FybGlzdHMsIGFuZCB0aGUgRmFsYW5nZSBFc3Bhw7FvbGEgZGUgbGFzIEpPTlMsIGEgZmFzY2lzdCBwb2xpdGljYWwgcGFydHkuWzE3XSBBZnRlciB0aGUgZGVhdGhzIG9mIFNhbmp1cmpvLCBFbWlsaW8gTW9sYSBhbmQgTWFudWVsIEdvZGVkIExsb3BpcywgRnJhbmNvIGVtZXJnZWQgYXMgdGhlIHJlbWFpbmluZyBsZWFkZXIgb2YgdGhlIE5hdGlvbmFsaXN0IHNpZGUuCgpUaGUgY291cCB3YXMgc3VwcG9ydGVkIGJ5IG1pbGl0YXJ5IHVuaXRzIGluIE1vcm9jY28sIFBhbXBsb25hLCBCdXJnb3MsIFphcmFnb3phLCBWYWxsYWRvbGlkLCBDw6FkaXosIEPDs3Jkb2JhLCBhbmQgU2V2aWxsZS4gSG93ZXZlciwgcmViZWxsaW5nIHVuaXRzIGluIGFsbW9zdCBhbGwgaW1wb3J0YW50IGNpdGllc+KAlHN1Y2ggYXMgTWFkcmlkLCBCYXJjZWxvbmEsIFZhbGVuY2lhLCBCaWxiYW8sIGFuZCBNw6FsYWdh4oCUZGlkIG5vdCBnYWluIGNvbnRyb2wsIGFuZCB0aG9zZSBjaXRpZXMgcmVtYWluZWQgdW5kZXIgdGhlIGNvbnRyb2wgb2YgdGhlIGdvdmVybm1lbnQuIFRoaXMgbGVmdCBTcGFpbiBtaWxpdGFyaWx5IGFuZCBwb2xpdGljYWxseSBkaXZpZGVkLiBUaGUgTmF0aW9uYWxpc3RzIGFuZCB0aGUgUmVwdWJsaWNhbiBnb3Zlcm5tZW50IGZvdWdodCBmb3IgY29udHJvbCBvZiB0aGUgY291bnRyeS4gVGhlIE5hdGlvbmFsaXN0IGZvcmNlcyByZWNlaXZlZCBtdW5pdGlvbnMsIHNvbGRpZXJzLCBhbmQgYWlyIHN1cHBvcnQgZnJvbSBGYXNjaXN0IEl0YWx5LCBOYXppIEdlcm1hbnkgYW5kIFBvcnR1Z2FsLCB3aGlsZSB0aGUgUmVwdWJsaWNhbiBzaWRlIHJlY2VpdmVkIHN1cHBvcnQgZnJvbSB0aGUgU292aWV0IFVuaW9uIGFuZCBNZXhpY28uIE90aGVyIGNvdW50cmllcywgc3VjaCBhcyB0aGUgVW5pdGVkIEtpbmdkb20sIEZyYW5jZSwgYW5kIHRoZSBVbml0ZWQgU3RhdGVzLCBjb250aW51ZWQgdG8gcmVjb2duaXNlIHRoZSBSZXB1YmxpY2FuIGdvdmVybm1lbnQgYnV0IGZvbGxvd2VkIGFuIG9mZmljaWFsIHBvbGljeSBvZiBub24taW50ZXJ2ZW50aW9uLiBEZXNwaXRlIHRoaXMgcG9saWN5LCB0ZW5zIG9mIHRob3VzYW5kcyBvZiBjaXRpemVucyBmcm9tIG5vbi1pbnRlcnZlbnRpb25pc3QgY291bnRyaWVzIGRpcmVjdGx5IHBhcnRpY2lwYXRlZCBpbiB0aGUgY29uZmxpY3QuIFRoZXkgZm91Z2h0IG1vc3RseSBpbiB0aGUgcHJvLVJlcHVibGljYW4gSW50ZXJuYXRpb25hbCBCcmlnYWRlcywgd2hpY2ggYWxzbyBpbmNsdWRlZCBzZXZlcmFsIHRob3VzYW5kIGV4aWxlcyBmcm9tIHByby1OYXRpb25hbGlzdCByZWdpbWVzLg==",
    )
except Exception as e:
    print(f"An error occurred: {e}")
