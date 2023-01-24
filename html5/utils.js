loadPresetsCodeJson = `{
    "default": "Y2hhb3MtY29kZW5hbWU6IGxpdGhpdW0Kam9iczoKICBjcHUtYXR0YWNrLWpvYjoKICAgIGFkZGl0aW9uYWwtbGFiZWxzOgogICAgICBjaGFvcy1jb250cm9sbGVyOiBrdWJlaW52YWRlcnMKICAgICAgY2hhb3MtdHlwZTogc3RyZXNzLW5nCiAgICAgIGNoYW9zLWNvZGVuYW1lOiBsaXRoaXVtCiAgICBpbWFnZTogZG9ja2VyLmlvL2x1Y2t5c2lkZWJ1cm4va3ViZWludmFkZXJzLXN0cmVzcy1uZzpsYXRlc3QKICAgIGNvbW1hbmQ6ICJzdHJlc3MtbmciCiAgICBhcmdzOgogICAgICAtIC0taGVscAoKICBtZW0tYXR0YWNrLWpvYjoKICAgIGFkZGl0aW9uYWwtbGFiZWxzOgogICAgICBjaGFvcy1jb250cm9sbGVyOiBrdWJlaW52YWRlcnMKICAgICAgY2hhb3MtdHlwZTogc3RyZXNzLW5nCiAgICAgIGNoYW9zLWNvZGVuYW1lOiBsaXRoaXVtCiAgICBpbWFnZTogZG9ja2VyLmlvL2x1Y2t5c2lkZWJ1cm4va3ViZWludmFkZXJzLXN0cmVzcy1uZzpsYXRlc3QKICAgIGNvbW1hbmQ6ICJzdHJlc3MtbmciCiAgICBhcmdzOgogICAgICAtIC0taGVscAoKZXhwZXJpbWVudHM6CiAgLSBuYW1lOiBjcHUtYXR0YWNrLWV4cAogICAgam9iOiBjcHUtYXR0YWNrLWpvYgogICAgbG9vcDogNQoKICAtIG5hbWU6IG1lbS1hdHRhY2stZXhwCiAgICBqb2I6IG1lbS1hdHRhY2stam9iCiAgICBsb29wOiA1CiAK",
    "cassandra": "ZnJvbSBjYXNzYW5kcmEuY2x1c3RlciBpbXBvcnQgQ2x1c3Rlcgpmcm9tIHJhbmRvbSBpbXBvcnQgcmFuZGludAppbXBvcnQgdGltZQoKZGVmIG1haW4oKToKICAgIGNsdXN0ZXIgPSBDbHVzdGVyKFsnMTI3LjAuMC4xJ10pCiAgICBzZXNzaW9uID0gY2x1c3Rlci5jb25uZWN0KCkKCiAgICBzZXNzaW9uLmV4ZWN1dGUoIkNSRUFURSBLRVlTUEFDRSBJRiBOT1QgRVhJU1RTIHRlc3QgV0lUSCBSRVBMSUNBVElPTiA9IHsgJ2NsYXNzJzogJ1NpbXBsZVN0cmF0ZWd5JywgJ3JlcGxpY2F0aW9uX2ZhY3Rvcic6IDEgfSIpCiAgICBzZXNzaW9uLmV4ZWN1dGUoIkNSRUFURSBUQUJMRSBJRiBOT1QgRVhJU1RTIHRlc3QubWVzc2FnZXMgKGlkIGludCBQUklNQVJZIEtFWSwgbWVzc2FnZSB0ZXh0KSIpCgogICAgZm9yIGkgaW4gcmFuZ2UoMTAwMCk6CiAgICAgICAgc2Vzc2lvbi5leGVjdXRlKCJJTlNFUlQgSU5UTyB0ZXN0Lm1lc3NhZ2VzIChpZCwgbWVzc2FnZSkgVkFMVUVTICglcywgJyVzJykiICUgKGksIHN0cihyYW5kaW50KDAsIDEwMDApKSkpCiAgICAgICAgdGltZS5zbGVlcCgwLjAwMSkKCiAgICBjbHVzdGVyLnNodXRkb3duKCkKCmlmIF9fbmFtZV9fID09ICJfX21haW5fXyI6CiAgICBtYWluKCk=",
    "consul": "aW1wb3J0IHRpbWUKaW1wb3J0IGNvbnN1bAoKIyBDb25uZWN0IHRvIHRoZSBDb25zdWwgY2x1c3RlcgpjbGllbnQgPSBjb25zdWwuQ29uc3VsKCkKCiMgQ29udGludW91c2x5IHJlZ2lzdGVyIGFuZCBkZXJlZ2lzdGVyIGEgc2VydmljZQp3aGlsZSBUcnVlOgogICAgIyBSZWdpc3RlciB0aGUgc2VydmljZQogICAgY2xpZW50LmFnZW50LnNlcnZpY2UucmVnaXN0ZXIoCiAgICAgICAgInN0cmVzcy10ZXN0LXNlcnZpY2UiLAogICAgICAgIHBvcnQ9ODA4MCwKICAgICAgICB0YWdzPVsic3RyZXNzLXRlc3QiXSwKICAgICAgICBjaGVjaz1jb25zdWwuQ2hlY2soKS50Y3AoImxvY2FsaG9zdCIsIDgwODAsICIxMHMiKQogICAgKQoKICAgICMgRGVyZWdpc3RlciB0aGUgc2VydmljZQogICAgY2xpZW50LmFnZW50LnNlcnZpY2UuZGVyZWdpc3Rlcigic3RyZXNzLXRlc3Qtc2VydmljZSIpCgogICAgdGltZS5zbGVlcCgxKQoK",
    "elasticsearch": "aW1wb3J0IHRpbWUKZnJvbSBlbGFzdGljc2VhcmNoIGltcG9ydCBFbGFzdGljc2VhcmNoCgojIENvbm5lY3QgdG8gdGhlIEVsYXN0aWNzZWFyY2ggY2x1c3RlcgplcyA9IEVsYXN0aWNzZWFyY2goWyJsb2NhbGhvc3QiXSkKCiMgQ29udGludW91c2x5IGluZGV4IGFuZCBkZWxldGUgZG9jdW1lbnRzCndoaWxlIFRydWU6CiAgICAjIEluZGV4IGEgZG9jdW1lbnQKICAgIGVzLmluZGV4KGluZGV4PSJ0ZXN0LWluZGV4IiwgZG9jX3R5cGU9InRlc3QtdHlwZSIsIGlkPTEsIGJvZHk9eyJ0ZXN0IjogInRlc3QifSkKCiAgICAjIERlbGV0ZSB0aGUgZG9jdW1lbnQKICAgIGVzLmRlbGV0ZShpbmRleD0idGVzdC1pbmRleCIsIGRvY190eXBlPSJ0ZXN0LXR5cGUiLCBpZD0xKQoKICAgIHRpbWUuc2xlZXAoMSkKCg==",
    "etcd3": "aW1wb3J0IHRpbWUKaW1wb3J0IGV0Y2QzCgojIENvbm5lY3QgdG8gdGhlIGV0Y2QzIGNsdXN0ZXIKY2xpZW50ID0gZXRjZDMuY2xpZW50KCkKCiMgQ29udGludW91c2x5IHNldCBhbmQgZGVsZXRlIGtleXMKd2hpbGUgVHJ1ZToKICAgICMgU2V0IGEga2V5CiAgICBjbGllbnQucHV0KCIvc3RyZXNzLXRlc3Qta2V5IiwgInN0cmVzcyB0ZXN0IHZhbHVlIikKCiAgICAjIERlbGV0ZSB0aGUga2V5CiAgICBjbGllbnQuZGVsZXRlKCIvc3RyZXNzLXRlc3Qta2V5IikKCiAgICB0aW1lLnNsZWVwKDEpCgo=",
    "gitlab": "aW1wb3J0IGdpdGxhYgppbXBvcnQgcmVxdWVzdHMKaW1wb3J0IHRpbWUKCmdsID0gZ2l0bGFiLkdpdGxhYignaHR0cHM6Ly9naXRsYWIuZXhhbXBsZS5jb20nLCBwcml2YXRlX3Rva2VuPSdteV9wcml2YXRlX3Rva2VuJykKCmRlZiBjcmVhdGVfcHJvamVjdCgpOgogICAgcHJvamVjdCA9IGdsLnByb2plY3RzLmNyZWF0ZSh7J25hbWUnOiAnTXkgUHJvamVjdCd9KQogICAgcHJpbnQoIkNyZWF0ZWQgcHJvamVjdDogIiwgcHJvamVjdC5uYW1lKQoKZGVmIG1haW4oKToKICAgIGZvciBpIGluIHJhbmdlKDEwMDApOgogICAgICAgIGNyZWF0ZV9wcm9qZWN0KCkKICAgICAgICB0aW1lLnNsZWVwKDAuMDAxKQoKaWYgX19uYW1lX18gPT0gIl9fbWFpbl9fIjoKICAgIG1haW4oKQ==",
    "http": "aW1wb3J0IHRpbWUKaW1wb3J0IHJlcXVlc3RzCgojIFNldCB1cCB0aGUgVVJMIHRvIHNlbmQgcmVxdWVzdHMgdG8KdXJsID0gJ2h0dHA6Ly9sb2NhbGhvc3Q6ODA4MC8nCgojIFNldCB1cCB0aGUgbnVtYmVyIG9mIHJlcXVlc3RzIHRvIHNlbmQKbnVtX3JlcXVlc3RzID0gMTAwMDAKCiMgU2V0IHVwIHRoZSBwYXlsb2FkIHRvIHNlbmQKcGF5bG9hZCA9IHsna2V5JzogJ3ZhbHVlJ30KCiMgU2VuZCB0aGUgcmVxdWVzdHMKc3RhcnRfdGltZSA9IHRpbWUudGltZSgpCmZvciBpIGluIHJhbmdlKG51bV9yZXF1ZXN0cyk6CiAgICByZXF1ZXN0cy5wb3N0KHVybCwganNvbj1wYXlsb2FkKQplbmRfdGltZSA9IHRpbWUudGltZSgpCgojIENhbGN1bGF0ZSB0aGUgdGhyb3VnaHB1dAp0aHJvdWdocHV0ID0gbnVtX3JlcXVlc3RzIC8gKGVuZF90aW1lIC0gc3RhcnRfdGltZSkKcHJpbnQoZidUaHJvdWdocHV0OiB7dGhyb3VnaHB1dH0gcmVxdWVzdHMvc2Vjb25kJykKCg==",
    "jira": "aW1wb3J0IHRpbWUKZnJvbSBqaXJhIGltcG9ydCBKSVJBCgojIENvbm5lY3QgdG8gdGhlIEppcmEgaW5zdGFuY2UKamlyYSA9IEpJUkEoCiAgICBzZXJ2ZXI9Imh0dHBzOi8vamlyYS5leGFtcGxlLmNvbSIsCiAgICBiYXNpY19hdXRoPSgidXNlciIsICJwYXNzd29yZCIpCikKCiMgQ29udGludW91c2x5IGNyZWF0ZSBhbmQgZGVsZXRlIGlzc3Vlcwp3aGlsZSBUcnVlOgogICAgIyBDcmVhdGUgYW4gaXNzdWUKICAgIGlzc3VlID0gamlyYS5jcmVhdGVfaXNzdWUoCiAgICAgICAgcHJvamVjdD0iUFJPSkVDVCIsCiAgICAgICAgc3VtbWFyeT0iU3RyZXNzIHRlc3QgaXNzdWUiLAogICAgICAgIGRlc2NyaXB0aW9uPSJUaGlzIGlzIGEgc3RyZXNzIHRlc3QgaXNzdWUuIiwKICAgICAgICBpc3N1ZXR5cGU9eyJuYW1lIjogIkJ1ZyJ9CiAgICApCgogICAgIyBEZWxldGUgdGhlIGlzc3VlCiAgICBqaXJhLmRlbGV0ZV9pc3N1ZShpc3N1ZSkKCiAgICB0aW1lLnNsZWVwKDEpCgo=",
    "kafka": "aW1wb3J0IHRpbWUKaW1wb3J0IHJhbmRvbQoKZnJvbSBrYWZrYSBpbXBvcnQgS2Fma2FQcm9kdWNlcgoKIyBTZXQgdXAgdGhlIEthZmthIHByb2R1Y2VyCnByb2R1Y2VyID0gS2Fma2FQcm9kdWNlcihib290c3RyYXBfc2VydmVycz1bJ2xvY2FsaG9zdDo5MDkyJ10pCgojIFNldCB1cCB0aGUgdG9waWMgdG8gc2VuZCBtZXNzYWdlcyB0bwp0b3BpYyA9ICd0ZXN0JwoKIyBTZXQgdXAgdGhlIG51bWJlciBvZiBtZXNzYWdlcyB0byBzZW5kCm51bV9tZXNzYWdlcyA9IDEwMDAwCgojIFNldCB1cCB0aGUgcGF5bG9hZCB0byBzZW5kCnBheWxvYWQgPSBiJ2EnICogMTAwMDAwMAoKIyBTZW5kIHRoZSBtZXNzYWdlcwpzdGFydF90aW1lID0gdGltZS50aW1lKCkKZm9yIGkgaW4gcmFuZ2UobnVtX21lc3NhZ2VzKToKICAgIHByb2R1Y2VyLnNlbmQodG9waWMsIHBheWxvYWQpCmVuZF90aW1lID0gdGltZS50aW1lKCkKCiMgQ2FsY3VsYXRlIHRoZSB0aHJvdWdocHV0CnRocm91Z2hwdXQgPSBudW1fbWVzc2FnZXMgLyAoZW5kX3RpbWUgLSBzdGFydF90aW1lKQpwcmludChmJ1Rocm91Z2hwdXQ6IHt0aHJvdWdocHV0fSBtZXNzYWdlcy9zZWNvbmQnKQoKIyBGbHVzaCBhbmQgY2xvc2UgdGhlIHByb2R1Y2VyCnByb2R1Y2VyLmZsdXNoKCkKcHJvZHVjZXIuY2xvc2UoKQo=",
    "kubernetes": "aW1wb3J0IHRpbWUKaW1wb3J0IGt1YmVybmV0ZXMKCiMgQ3JlYXRlIGEgS3ViZXJuZXRlcyBjbGllbnQKY2xpZW50ID0ga3ViZXJuZXRlcy5jbGllbnQuQ29yZVYxQXBpKCkKCiMgQ29udGludW91c2x5IGNyZWF0ZSBhbmQgZGVsZXRlIHBvZHMKd2hpbGUgVHJ1ZToKICAgICMgQ3JlYXRlIGEgcG9kCiAgICBwb2QgPSBrdWJlcm5ldGVzLmNsaWVudC5WMVBvZCgKICAgICAgICBtZXRhZGF0YT1rdWJlcm5ldGVzLmNsaWVudC5WMU9iamVjdE1ldGEobmFtZT0ic3RyZXNzLXRlc3QtcG9kIiksCiAgICAgICAgc3BlYz1rdWJlcm5ldGVzLmNsaWVudC5WMVBvZFNwZWMoCiAgICAgICAgICAgIGNvbnRhaW5lcnM9W2t1YmVybmV0ZXMuY2xpZW50LlYxQ29udGFpbmVyKAogICAgICAgICAgICAgICAgbmFtZT0ic3RyZXNzLXRlc3QtY29udGFpbmVyIiwKICAgICAgICAgICAgICAgIGltYWdlPSJuZ2lueDpsYXRlc3QiCiAgICAgICAgICAgICldCiAgICAgICAgKQogICAgKQogICAgY2xpZW50LmNyZWF0ZV9uYW1lc3BhY2VkX3BvZChuYW1lc3BhY2U9ImRlZmF1bHQiLCBib2R5PXBvZCkKCiAgICAjIERlbGV0ZSB0aGUgcG9kCiAgICBjbGllbnQuZGVsZXRlX25hbWVzcGFjZWRfcG9kKG5hbWU9InN0cmVzcy10ZXN0LXBvZCIsIG5hbWVzcGFjZT0iZGVmYXVsdCIpCgogICAgdGltZS5zbGVlcCgxKQoK",
    "mongodb": "aW1wb3J0IHRpbWUKaW1wb3J0IHJhbmRvbQpmcm9tIHB5bW9uZ28gaW1wb3J0IE1vbmdvQ2xpZW50CgojIFNldCB1cCB0aGUgTW9uZ29EQiBjbGllbnQKY2xpZW50ID0gTW9uZ29DbGllbnQoJ21vbmdvZGI6Ly9sb2NhbGhvc3Q6MjcwMTcvJykKCiMgU2V0IHVwIHRoZSBkYXRhYmFzZSBhbmQgY29sbGVjdGlvbiB0byB1c2UKZGIgPSBjbGllbnRbJ3Rlc3QnXQpjb2xsZWN0aW9uID0gZGJbJ3Rlc3QnXQoKIyBTZXQgdXAgdGhlIG51bWJlciBvZiBkb2N1bWVudHMgdG8gaW5zZXJ0Cm51bV9kb2N1bWVudHMgPSAxMDAwMAoKIyBTZXQgdXAgdGhlIHBheWxvYWQgdG8gaW5zZXJ0CnBheWxvYWQgPSB7J2tleSc6ICdhJyAqIDEwMDAwMDB9CgojIEluc2VydCB0aGUgZG9jdW1lbnRzCnN0YXJ0X3RpbWUgPSB0aW1lLnRpbWUoKQpmb3IgaSBpbiByYW5nZShudW1fZG9jdW1lbnRzKToKICAgIGNvbGxlY3Rpb24uaW5zZXJ0X29uZShwYXlsb2FkKQplbmRfdGltZSA9IHRpbWUudGltZSgpCgojIENhbGN1bGF0ZSB0aGUgdGhyb3VnaHB1dAp0aHJvdWdocHV0ID0gbnVtX2RvY3VtZW50cyAvIChlbmRfdGltZSAtIHN0YXJ0X3RpbWUpCnByaW50KGYnVGhyb3VnaHB1dDoge3Rocm91Z2hwdXR9IGRvY3VtZW50cy9zZWNvbmQnKQoKIyBDbG9zZSB0aGUgY2xpZW50CmNsaWVudC5jbG9zZSgpCgo=",
    "mysql": "aW1wb3J0IHRpbWUKaW1wb3J0IG15c3FsLmNvbm5lY3RvcgoKIyBDb25uZWN0IHRvIHRoZSBNeVNRTCBkYXRhYmFzZQpjbnggPSBteXNxbC5jb25uZWN0b3IuY29ubmVjdCgKICAgIGhvc3Q9ImxvY2FsaG9zdCIsCiAgICB1c2VyPSJyb290IiwKICAgIHBhc3N3b3JkPSJwYXNzd29yZCIsCiAgICBkYXRhYmFzZT0idGVzdCIKKQpjdXJzb3IgPSBjbnguY3Vyc29yKCkKCiMgQ29udGludW91c2x5IGluc2VydCByb3dzIGludG8gdGhlICJ0ZXN0X3RhYmxlIiB0YWJsZQp3aGlsZSBUcnVlOgogICAgY3Vyc29yLmV4ZWN1dGUoIklOU0VSVCBJTlRPIHRlc3RfdGFibGUgKGNvbDEsIGNvbDIpIFZBTFVFUyAoJXMsICVzKSIsICgxLCAyKSkKICAgIGNueC5jb21taXQoKQogICAgdGltZS5zbGVlcCgxKQoKIyBDbG9zZSB0aGUgZGF0YWJhc2UgY29ubmVjdGlvbgpjbnguY2xvc2UoKQoK",
    "nomad": "aW1wb3J0IHRpbWUKaW1wb3J0IG5vbWFkCgojIENyZWF0ZSBhIE5vbWFkIGNsaWVudApjbGllbnQgPSBub21hZC5Ob21hZCgpCgojIENyZWF0ZSBhIGJhdGNoIG9mIGpvYnMgdG8gc3VibWl0IHRvIE5vbWFkCmpvYnMgPSBbewogICAgIk5hbWUiOiAic3RyZXNzLXRlc3Qtam9iIiwKICAgICJUeXBlIjogImJhdGNoIiwKICAgICJEYXRhY2VudGVycyI6IFsiZGMxIl0sCiAgICAiVGFza0dyb3VwcyI6IFt7CiAgICAgICAgIk5hbWUiOiAic3RyZXNzLXRlc3QtdGFzay1ncm91cCIsCiAgICAgICAgIlRhc2tzIjogW3sKICAgICAgICAgICAgIk5hbWUiOiAic3RyZXNzLXRlc3QtdGFzayIsCiAgICAgICAgICAgICJEcml2ZXIiOiAicmF3X2V4ZWMiLAogICAgICAgICAgICAiQ29uZmlnIjogewogICAgICAgICAgICAgICAgImNvbW1hbmQiOiAic2xlZXAgMTAiCiAgICAgICAgICAgIH0sCiAgICAgICAgICAgICJSZXNvdXJjZXMiOiB7CiAgICAgICAgICAgICAgICAiQ1BVIjogNTAwLAogICAgICAgICAgICAgICAgIk1lbW9yeU1CIjogNTEyCiAgICAgICAgICAgIH0KICAgICAgICB9XQogICAgfV0KfV0KCiMgQ29udGludW91c2x5IHN1Ym1pdCB0aGUgYmF0Y2ggb2Ygam9icyB0byBOb21hZAp3aGlsZSBUcnVlOgogICAgZm9yIGpvYiBpbiBqb2JzOgogICAgICAgIGNsaWVudC5qb2JzLmNyZWF0ZShqb2IpCiAgICB0aW1lLnNsZWVwKDEpCgo=",
    "postgresql": "aW1wb3J0IHRpbWUKaW1wb3J0IHJhbmRvbQppbXBvcnQgcHN5Y29wZzIKCiMgU2V0IHVwIHRoZSBjb25uZWN0aW9uIHBhcmFtZXRlcnMKcGFyYW1zID0gewogICAgJ2hvc3QnOiAnbG9jYWxob3N0JywKICAgICdwb3J0JzogJzU0MzInLAogICAgJ2RhdGFiYXNlJzogJ3Rlc3QnLAogICAgJ3VzZXInOiAncG9zdGdyZXMnLAogICAgJ3Bhc3N3b3JkJzogJ3Bhc3N3b3JkJwp9CgojIENvbm5lY3QgdG8gdGhlIGRhdGFiYXNlCmNvbm4gPSBwc3ljb3BnMi5jb25uZWN0KCoqcGFyYW1zKQoKIyBTZXQgdXAgdGhlIGN1cnNvcgpjdXIgPSBjb25uLmN1cnNvcigpCgojIFNldCB1cCB0aGUgdGFibGUgYW5kIHBheWxvYWQgdG8gaW5zZXJ0CnRhYmxlX25hbWUgPSAndGVzdCcKcGF5bG9hZCA9ICdhJyAqIDEwMDAwMDAKCiMgU2V0IHVwIHRoZSBudW1iZXIgb2Ygcm93cyB0byBpbnNlcnQKbnVtX3Jvd3MgPSAxMDAwMAoKIyBJbnNlcnQgdGhlIHJvd3MKc3RhcnRfdGltZSA9IHRpbWUudGltZSgpCmZvciBpIGluIHJhbmdlKG51bV9yb3dzKToKICAgIGN1ci5leGVjdXRlKGYiSU5TRVJUIElOVE8ge3RhYmxlX25hbWV9IChjb2wpIFZBTFVFUyAoJ3twYXlsb2FkfScpIikKY29ubi5jb21taXQoKQplbmRfdGltZSA9IHRpbWUudGltZSgpCgojIENhbGN1bGF0ZSB0aGUgdGhyb3VnaHB1dAp0aHJvdWdocHV0ID0gbnVtX3Jvd3MgLyAoZW5kX3RpbWUgLSBzdGFydF90aW1lKQpwcmludChmJ1Rocm91Z2hwdXQ6IHt0aHJvdWdocHV0fSByb3dzL3NlY29uZCcpCgojIENsb3NlIHRoZSBjdXJzb3IgYW5kIGNvbm5lY3Rpb24KY3VyLmNsb3NlKCkKY29ubi5jbG9zZSgpCgo=",
    "prometheus": "aW1wb3J0IHRpbWUKaW1wb3J0IHJhbmRvbQpmcm9tIHByb21ldGhldXNfY2xpZW50IGltcG9ydCBDb2xsZWN0b3JSZWdpc3RyeSwgR2F1Z2UsIHB1c2hfdG9fZ2F0ZXdheQoKIyBTZXQgdXAgdGhlIG1ldHJpY3MgcmVnaXN0cnkKcmVnaXN0cnkgPSBDb2xsZWN0b3JSZWdpc3RyeSgpCgojIFNldCB1cCB0aGUgbWV0cmljIHRvIHB1c2gKZ2F1Z2UgPSBHYXVnZSgndGVzdF9nYXVnZScsICdBIHRlc3QgZ2F1Z2UnLCByZWdpc3RyeT1yZWdpc3RyeSkKCiMgU2V0IHVwIHRoZSBwdXNoIGdhdGV3YXkgVVJMCnB1c2hfZ2F0ZXdheSA9ICdodHRwOi8vbG9jYWxob3N0OjkwOTEnCgojIFNldCB1cCB0aGUgbnVtYmVyIG9mIHB1c2hlcyB0byBzZW5kCm51bV9wdXNoZXMgPSAxMDAwMAoKIyBTZXQgdXAgdGhlIG1ldHJpYyB2YWx1ZSB0byBwdXNoCnZhbHVlID0gcmFuZG9tLnJhbmRvbSgpCgojIFB1c2ggdGhlIG1ldHJpYwpzdGFydF90aW1lID0gdGltZS50aW1lKCkKZm9yIGkgaW4gcmFuZ2UobnVtX3B1c2hlcyk6CiAgICBnYXVnZS5zZXQodmFsdWUpCiAgICBwdXNoX3RvX2dhdGV3YXkocHVzaF9nYXRld2F5LCBqb2I9J3Rlc3Rfam9iJywgcmVnaXN0cnk9cmVnaXN0cnkpCmVuZF90aW1lID0gdGltZS50aW1lKCkKCiMgQ2FsY3VsYXRlIHRoZSB0aHJvdWdocHV0CnRocm91Z2hwdXQgPSBudW1fcHVzaGVzIC8gKGVuZF90aW1lIC0gc3RhcnRfdGltZSkKcHJpbnQoZidUaHJvdWdocHV0OiB7dGhyb3VnaHB1dH0gcHVzaGVzL3NlY29uZCcpCgo=",
    "rabbit": "aW1wb3J0IHBpa2EKaW1wb3J0IHRpbWUKCmRlZiBzZW5kX21lc3NhZ2UoY2hhbm5lbCwgbWVzc2FnZSk6CiAgICBjaGFubmVsLmJhc2ljX3B1Ymxpc2goZXhjaGFuZ2U9JycsIHJvdXRpbmdfa2V5PSd0ZXN0X3F1ZXVlJywgYm9keT1tZXNzYWdlKQogICAgcHJpbnQoIlNlbnQgbWVzc2FnZTogIiwgbWVzc2FnZSkKCmRlZiBtYWluKCk6CiAgICBjb25uZWN0aW9uID0gcGlrYS5CbG9ja2luZ0Nvbm5lY3Rpb24ocGlrYS5Db25uZWN0aW9uUGFyYW1ldGVycygnbG9jYWxob3N0JykpCiAgICBjaGFubmVsID0gY29ubmVjdGlvbi5jaGFubmVsKCkKICAgIGNoYW5uZWwucXVldWVfZGVjbGFyZShxdWV1ZT0ndGVzdF9xdWV1ZScpCgogICAgZm9yIGkgaW4gcmFuZ2UoMTAwMCk6CiAgICAgICAgc2VuZF9tZXNzYWdlKGNoYW5uZWwsIHN0cihpKSkKICAgICAgICB0aW1lLnNsZWVwKDAuMDAxKQoKICAgIGNvbm5lY3Rpb24uY2xvc2UoKQoKaWYgX19uYW1lX18gPT0gIl9fbWFpbl9fIjoKICAgIG1haW4oKQ==",
    "SSH": "aW1wb3J0IHBhcmFtaWtvCgojIERlZmluZSBzZXJ2ZXJzIGFycmF5CnNlcnZlcnMgPSBbJ3NlcnZlcjEnLCAnc2VydmVyMicsICdzZXJ2ZXIzJ10KCmZvciBzZXJ2ZXIgaW4gc2VydmVyczoKICAgIHB1YmxpY19rZXkgPSBwYXJhbWlrby5SU0FLZXkoZGF0YT1iJ3lvdXItcHVibGljLWtleS1zdHJpbmcnKQogICAgc3NoID0gcGFyYW1pa28uU1NIQ2xpZW50KCkKICAgIHNzaC5zZXRfbWlzc2luZ19ob3N0X2tleV9wb2xpY3kocGFyYW1pa28uQXV0b0FkZFBvbGljeSgpKQogICAgc3NoLmNvbm5lY3QoaG9zdG5hbWU9J3lvdXItc2VydmVyLW5hbWUnLCB1c2VybmFtZT0neW91ci11c2VybmFtZScsIHBrZXk9cHVibGljX2tleSkKICAgIHN0ZGluLCBzdGRvdXQsIHN0ZGVyciA9IHNzaC5leGVjX2NvbW1hbmQoJ3lvdXItY29tbWFuZCcpCiAgICBwcmludChzdGRvdXQucmVhZCgpKQogICAgc3NoLmNsb3NlKCkK",
    "vault": "aW1wb3J0IHRpbWUKaW1wb3J0IGh2YWMKCiMgQ29ubmVjdCB0byB0aGUgVmF1bHQgaW5zdGFuY2UKY2xpZW50ID0gaHZhYy5DbGllbnQoKQpjbGllbnQuYXV0aF9hcHByb2xlKGFwcHJvbGVfaWQ9ImFwcHJvbGUtaWQiLCBzZWNyZXRfaWQ9InNlY3JldC1pZCIpCgojIENvbnRpbnVvdXNseSByZWFkIGFuZCB3cml0ZSBzZWNyZXRzCndoaWxlIFRydWU6CiAgICAjIFdyaXRlIGEgc2VjcmV0CiAgICBjbGllbnQud3JpdGUoInNlY3JldC9zdHJlc3MtdGVzdCIsIHZhbHVlPSJzZWNyZXQgdmFsdWUiKQoKICAgICMgUmVhZCB0aGUgc2VjcmV0CiAgICBjbGllbnQucmVhZCgic2VjcmV0L3N0cmVzcy10ZXN0IikKCiAgICB0aW1lLnNsZWVwKDEpCgo="
  }`;

  function switchColorMode() {

    let bodyElement = document.getElementById("kinvBody");
    let buttonsLightElement = document.getElementsByClassName("btn-light");
    let textkinv = document.getElementsByClassName("text-kinv");
    let alertkinv = document.getElementsByClassName("alert-kinv");

    if (current_color_mode == "light") {
      bodyElement.style.backgroundColor = "#0a0a0a";
      current_color_mode = "dark";

      for (var i = 0; i < buttonsLightElement.length; i++) { 
        console.log("[COLOR-MODE-BUTTONS] Change color of " + buttonsLightElement[i].id);
        document.getElementById(buttonsLightElement[i].id).style.backgroundColor = "#1ed931";
      }

      for (var i = 0; i < textkinv.length; i++) { 
        console.log("[COLOR-MODE-TEXT-KINV] Change color of " + textkinv[i].id);
        document.getElementById(textkinv[i].id).style.color = "#1ed931";
      }

      for (var i = 0; i < alertkinv.length; i++) { 
        console.log("[COLOR-MODE-ALERT-KINV] Change color of " + alertkinv[i].id);
        document.getElementById(alertkinv[i].id).style.color = "#1ed931";
        document.getElementById(alertkinv[i].id).style.backgroundColor = "#0a0a0a";
        document.getElementById(alertkinv[i].id).style.borderColor = "#ffffff";
      }

      document.getElementById("logTailRegex").style.backgroundColor = "#0a0a0a";
      document.getElementById("logTailRegex").style.color = "#ffffff";
      document.getElementById("switchColorModeLink").innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg"  style="color: #ffffff;" width="16" height="16" fill="currentColor" class="bi bi-sun-fill" viewBox="0 0 16 16">
        <path d="M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707zM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z"/>
      </svg>
      `;
      return;
    }

    if (current_color_mode == "dark") {
      bodyElement.style.backgroundColor = "#ffffff";
      current_color_mode = "light";

      for (var i = 0; i < buttonsLightElement.length; i++) { 
        console.log("[COLOR-MODE-BUTTONS] Change color of " + buttonsLightElement[i].id);
        document.getElementById(buttonsLightElement[i].id).style.backgroundColor = "";
      }

      for (var i = 0; i < textkinv.length; i++) { 
        console.log("[COLOR-MODE-TEXT-KINV] Change color of " + textkinv[i].id);
        document.getElementById(textkinv[i].id).style.color = "";
      }

      for (var i = 0; i < alertkinv.length; i++) { 
        console.log("[COLOR-MODE-ALERT-KINV] Change color of " + alertkinv[i].id);
        document.getElementById(alertkinv[i].id).style.color = "";
        document.getElementById(alertkinv[i].id).style.backgroundColor = "";
        document.getElementById(alertkinv[i].id).style.borderColor = "";
      }

      document.getElementById("logTailRegex").style.backgroundColor = "";
      document.getElementById("logTailRegex").style.color = "";
      document.getElementById("switchColorModeLink").innerHTML = `

      <svg xmlns="http://www.w3.org/2000/svg" style="color: #ffffff;" width="16" height="16" fill="currentColor" class="bi bi-moon-fill" viewBox="0 0 16 16">
        <path d="M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 0 1 .81.316.733.733 0 0 1-.031.893A8.349 8.349 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 0 1 6 .278z"/>
      </svg>
      `;
    }

  }

  function closeSetLoadTestModal() {
    $('#setLoadTestModal').modal('hide');
    modal_opened = false;
  }

  function loadPreset(tool, lang) {
    let decodedStringAtoB = "";
    console.log("[GET-PRESETS] Loaded preset for " + tool + " with lang " + lang);

    latest_preset_name = tool;
    latest_preset_lang = lang;
    console.log("[GET-PRESETS] |" + lang + "|");

    if (lang == "k-inv") {
      loadSavedPreset(tool, lang, $('#chaosProgramTextArea').text());
      if (tool.toLowerCase() == "default") {
        document.getElementById("resetToDefaultButton").style.display = "none";
        document.getElementById("deleteChaosProgramButton").style.display = "none";
      } else {
        document.getElementById("resetToDefaultButton").style.display = "none";
        document.getElementById("deleteChaosProgramButton").style.display = "block";
      }
    } else {
      console.log("[GET-PRESETS] foo Loaded preset for " + tool + " with lang " + lang);
      console.log("[GET-PRESET] loadPresetsCodeJson " +loadPresetsCodeJson);
      loadPresetsCodeParsed = JSON.parse(loadPresetsCodeJson);
      decodedStringAtoB = atob(loadPresetsCodeParsed[tool]);
      loadSavedPreset(tool, lang, decodedStringAtoB);
      document.getElementById("resetToDefaultButton").style.display = "block";
      document.getElementById("deleteChaosProgramButton").style.display = "none";
    }
    $("#presetLang").val(lang);
    $("#presetName").val(tool);
    $('#setLoadTestModal').modal('show');
    modal_opened = true;
    log_tail_switch = false;
    log_tail_div.style.display = "none";
    log_tail_screen.style.display = "none"
    $("#logConsoleButton").text("Start Logs Tail");
    if (programming_mode_switch == false) {
      startProgrammingMode();
    }
  }

  function changeRandomFactor() {
    randomFactor = $("#randomFactorInput").val();
    $("#currentRandomFactor").text(randomFactor);
  }

  function zoomIn() {
    document.getElementById("gameContainer").style.width = "100%"
    document.getElementById("gameContainer").style.height = "100%";
    document.getElementById("zoomInGameScreenInput").disabled = true;
    document.getElementById("zoomOutGameScreenInput").disabled = false; 
    document.getElementById("zoomInGameScreenInput2").disabled = true;
    document.getElementById("zoomOutGameScreenInput2").disabled = false;
    document.getElementById("loadButtonGroup").style.width = "1200px";
  }

  function zoomOut() {
    var gameContainerWidth = document.getElementById("gameContainer").style.width;
    var gameContainerHeight = document.getElementById("gameContainer").style.height;
    document.getElementById("gameContainer").style.width = "50%"
    document.getElementById("gameContainer").style.height = "50%"
    document.getElementById("zoomInGameScreenInput").disabled = false; 
    document.getElementById("zoomOutGameScreenInput").disabled = true;
    document.getElementById("zoomInGameScreenInput2").disabled = false; 
    document.getElementById("zoomOutGameScreenInput2").disabled = true; 
    document.getElementById("loadButtonGroup").style.width = "900px";
  }

  function controlAutoPilot() {
    if (autoPilot) {
      autoPilot = false;
      $("#controlAutoPilotButton").text("Start");
    } else {
      autoPilot = true;
      $("#controlAutoPilotButton").text("Stop");
    }
  }

  function setLogConsole() {
    if (log_tail_switch) {
      $("#logConsoleButton").text("Start Logs Tail");
      $('#alert_placeholder3').replaceWith(alert_div_webtail + 'Stopping log tail...</div>');
      log_tail_switch = false;
      disableLogTail();
    } else {
      $('#alert_placeholder3').replaceWith(alert_div_webtail + 'Starting log tail...</div>');
      $("#logConsoleButton").text("Stop Logs Tail");
      log_tail_switch = true;
      log_tail_div.style.display = "block";
      log_tail_screen.style.display = "block"
      setLogRegex();
      enableLogTail();
    }
  }

  function startGameMode() {
    if (game_mode_switch) {
      game_mode_switch = false;
      $("#gameModeButton").text("Enable Game Mode");
    } else {
      game_mode_switch = true;
      document.getElementById("gameContainer").style.width = "50%";
      document.getElementById("gameContainer").style.height = "50%";
      //document.getElementById("loadButtonGroup").style.width = "650px";
      $("#gameModeButton").text("Disable Game Mode");
      $("#programmingModeButton").text("Enable Prog. Mode");
      programming_mode_switch = false;
    }
    if (game_buttons.style.display === "none") {
      game_buttons.style.display = "block";
    } else {
      game_buttons.style.display = "none";
    }
    if (game_screen.style.display === "none") {
      game_screen.style.display = "block";
    } else {
      game_screen.style.display = "none";
    }
    chaos_program_screen.style.display = "none";
    programming_mode_buttons.style.display = "none";
  }

  function startProgrammingMode() {
    if (programming_mode_switch) {
      programming_mode_switch = false;
      $("#programmingModeButton").text("Enable Prog. Mode");
    } else {
      document.getElementById("gameContainer").style.width = "100%";
      document.getElementById("gameContainer").style.height = "100%";
      document.getElementById("loadButtonGroup").style.width = "1250px";

      programming_mode_switch = true;
      game_mode_switch = false;
      $("#gameModeButton").text("Enable Game Mode");
      $("#programmingModeButton").text("Disable Prog. Mode");
    }
    if (chaos_program_screen.style.display === "none") {
      chaos_program_screen.style.display = "block";
    } else {
      chaos_program_screen.style.display = "none";
    }
    if (programming_mode_buttons.style.display === "none") {
        programming_mode_buttons.style.display = "block";
    } else {
      programming_mode_buttons.style.display = "none";
    }
    game_buttons.style.display = "none";
    game_screen.style.display = "none";
  }

  function showSpecialKeys() {
    $('#showSpecialKeysModal').modal('show');
    modal_opened = true;
  }

  function showCurrentChaosContainer() {
    getCurrentChaosContainer();
    $('#currentChaosContainerModal').modal('show');
    modal_opened = true;
  }

  function closeCurrentChaosJobModal() {
    $('#currentChaosContainerModal').modal('hide');
    modal_opened = false;
  }

  function showSetCurrentChaosContainer() {
    $('#alert_placeholder2').text('');
    getCurrentChaosContainer();
    $('#setChaosContainerModal').modal('show');
    modal_opened = true;
  }

  function closeSetChaosContainerModal() {
    $('#setChaosContainerModal').modal('hide');
    modal_opened = false;
  }

  function closeSpecialKeysModal() {
    $('#showSpecialKeysModal').modal('hide');
    modal_opened = false;
  }

  function closeKubeLinterModal() {
    $('#kubeLinterModal').modal('hide');
    modal_opened = false;
  }