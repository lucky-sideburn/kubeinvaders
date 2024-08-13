/* Programming Mode Functions */
function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

/* TODO: this is very bad... change asap :D */
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

function runChaosProgram() {
  chaosProgram = $('#chaosProgramTextArea').val();
  chaosProgramWithCodename = chaosProgram.replace(codename_regex, "chaos-codename: " + codename);
  $('#chaosProgramTextArea').val(chaosProgramWithCodename);
  codename_configured = true;

  //var now = new Date().toLocaleString().replace(',','')
  //$('#alert_placeholder_programming_mode').replaceWith(alert_div + 'Chaos Program launched at ' + now + ' </div>');

  var oReq = new XMLHttpRequest();
  oReq.open("POST", k8s_url + "/kube/chaos/programming_mode?id=" + random_code, true);
  oReq.onreadystatechange = function () {
      if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
          now = new Date().toLocaleString().replace(',','')
          if (this.responseText.includes("Invalid")) {
            $('#alert_placeholder_programming_mode').replaceWith(alert_div + this.responseText + ' </div>');
          }
         else {
            $('#alert_placeholder_programming_mode').replaceWith(alert_div + this.responseText + 'Chaos Program loaded at ' + now + ' </div>');
         }  
      }
  };;
  oReq.setRequestHeader("Content-Type", "application/json");
  oReq.send($('#chaosProgramTextArea').val());
}

function savePreset(action) {
  console.log("[SAVE-PRESET-CHAOSPROGRAM] Saving item...");
  var presetName = "";
  presetBody = $("#currentLoadTest").val();
  console.log("[SAVE-PRESET-CHAOSPROGRAM] Saving " + presetBody);

  if (action == "save-chaos-program") {
      presetLang = "k-inv";
      presetName = codename + "-" + rand_id();
      latest_preset_lang = "k-inv";
      console.log("[SAVE-PRESET-CHAOSPROGRAM] lang: " + presetLang + " name:" + presetName);
      presetBody =  $('#chaosProgramTextArea').val();
      document.getElementById("resetToDefaultButton").style.display = "none";
      document.getElementById("deleteChaosProgramButton").style.display = "block";
  }
  else if (latest_preset_lang == "k-inv") {
      presetLang = "k-inv";
      presetName = codename;
      latest_preset_lang = "k-inv";
      console.log("[SAVE-PRESET-CHAOSPROGRAM] lang: " + presetLang + " name:" + codename);
      presetBody = $('#currentLoadTest').val();
      document.getElementById("resetToDefaultButton").style.display = "none";
      document.getElementById("deleteChaosProgramButton").style.display = "block";
  }
  else {
      presetLang = latest_preset_lang;
      presetName = latest_preset_name;    
      document.getElementById("resetToDefaultButton").style.display = "block";
      document.getElementById("deleteChaosProgramButton").style.display = "none";
  }

  //console.log("Saving preset. name:" + presetName + ", lang:" + presetName + ", body: " + presetBody);
  var oReq = new XMLHttpRequest();

  oReq.open("POST", k8s_url + "/chaos/loadpreset/save?name=" + presetName + "&lang=" + presetLang, true);

  oReq.onreadystatechange = function () {
      if (this.readyState === XMLHttpRequest.DONE && this.status === 200 && (action == "apply" || action == "save-chaos-program")) {
          if (latest_preset_lang == "k-inv") {
              // console.log("[SAVE-PRESET-CHAOSPROGRAM] Payload: " + $('#currentLoadTest').val());
              if ($('#currentLoadTest').val() != "") {
                  presetBody = $('#currentLoadTest').val();
              } 
                 
              //$('#chaosProgramTextArea').val(presetBody);
              
              document.getElementById("chaosProgramTextArea").value = presetBody;
          } 
          else {
              presetBody = $('#chaosProgramTextArea').val(`chaos-codename: ${codename}
jobs:
${presetName}-job:
  additional-labels:
      chaos-controller: kubeinvaders
      chaos-lang: ${presetLang}
      chaos-type: loadtest
      chaos-codename: ${codename}
  image: docker.io/luckysideburn/chaos-exec:v1.0.4
  command: bash
  args:
  - start.sh
  - ${presetLang}
  - code=${btoa(presetBody).trim()}

experiments:
- name: ${presetName}-exp
job: ${presetName}-job
loop: 5`);
          }
      }
  };;

  oReq.setRequestHeader("Content-Type", "application/json");
  oReq.send(presetBody);
  closeSetLoadTestModal();
  
  if (action != "save-chaos-program") {
      let presetNameCapitalized = presetName.charAt(0).toUpperCase() + presetName.slice(1);
      var buttonId = "load" + presetNameCapitalized.trim();
      // document.getElementById(buttonId).classList.remove('btn-light');
      // document.getElementById(buttonId).classList.add('btn-light-saved');
  }
  else {
      console.log("[SAVE-PRESET-CHAOSPROGRAM] Creating new button for lang: " + presetLang + " name:" + presetName);
      createChaosProgramButton(presetName, 'k-inv'); 
  }

  getSavedPresets();

  if (action == "apply" && programming_mode_switch == false){
      startProgrammingMode();
  }
}

function drawChaosProgramFlow() {
  var chaosProgram = "";
  chaosProgram = $('#chaosProgramTextArea').val();

  var oReq = new XMLHttpRequest();
  oReq.open("POST", k8s_url + "/chaos/programs/json-flow", true);

  oReq.onreadystatechange = function () {
      if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
          if (IsJsonString(this.responseText)){
              var flow = JSON.parse(this.responseText);
              var flow_html = "";
              let i = 0;
              var times = "";
              $('#chaosProgramFlow').html("");

              while (i < flow["experiments"].length) {
                  if (flow["experiments"][i]["loop"] == 1){
                      times = "once";
                  }
                  else if (flow["experiments"][i]["loop"] == 2) {
                      times = "twice"
                  }
                  else {
                      times = flow["experiments"][i]["loop"] + " times"
                  }
                  if (current_color_mode == "light") {
                      flow_html = flow_html + '<div class="row"><div class="alert alert-light alert-kinv" id="' +  random_code + Math.floor(Math.random() * 9999) +'" role="alert" style="border-color: #000000; border-width: 1.5px;">Do ' + flow["experiments"][i]["name"] + ' ' + times + '</div></div>';
                  }
                  else {
                      flow_html = flow_html + '<div class="row"><div class="alert alert-light alert-kinv" id="' +  random_code + Math.floor(Math.random() * 9999) +'" role="alert" style="border-color: #ffffff; color: #1ed931; background-color: #0a0a0a; border-width: 1.5px;">Do ' + flow["experiments"][i]["name"] + ' ' + times + '</div></div>';
                  }
                  search_job = codename + ":" + flow["experiments"][i]["name"]

                  flow_html = flow_html + '<img src="images/down-arrow.png" width="30" height="30" style="margin-bottom: 2%;">';

                  for (let [key, value] of chaos_jobs_status) {
                      if (key.search(search_job) != -1 ) {
                          if (current_color_mode == "light") {
                              flow_html = flow_html + '<div class="row"><div class="alert alert-light alert-kinv" id="' +  random_code + Math.floor(Math.random() * 9999) +'" role="alert" style="border-color: #000000; border-width: 1.5px;">[' + key.split(":")[2] + '] Status: ' + value + '</div></div>';
                          } else {
                              flow_html = flow_html + '<div class="row"><div class="alert alert-light alert-kinv" id="' +  random_code + Math.floor(Math.random() * 9999) +'" role="alert" style="border-color: #ffffff; color: #1ed931; background-color: #0a0a0a; border-width: 1.5px;">[' + key.split(":")[2] + '] Status: ' + value + '</div></div>';
                          }
                      }
                  }
                  i++;
              }
              $('#chaosProgramFlow').html(flow_html);
          }
          else {
              $('#chaosProgramFlow').html(this.responseText);  
          }
      }
  };;

  oReq.setRequestHeader("Content-Type", "application/json");
  oReq.send(chaosProgram);
}

function getSavedPresets() {
  var oReq = new XMLHttpRequest();
  oReq.onreadystatechange = function () {
      if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
          if ((this.responseText.trim() != "nil") && (this.responseText.trim() != "")) {
              // console.log("[GET-PRESETS] Response from backend: <" + this.responseText.trim() + ">");
              var savedPresets = this.responseText.split(",");
              for (i = 0; i < savedPresets.length; i++) {
                  var currentPresetName = savedPresets[i].split("_")[1];
                  currentPresetName = currentPresetName.charAt(0).toUpperCase() + currentPresetName.slice(1);
                  //console.log("[GET-PRESETS] computing preset: " + currentPresetName);
                  var buttonId = "load" + currentPresetName.trim();
                  // console.log("[GET-PRESETS] Change border color of buttonId: " + buttonId);
                  // console.log(document.getElementById(buttonId));
                  if (document.getElementById(buttonId) == null){
                      // console.log("[GET-PRESETS] Appending button to loadButtonGroup. id: " + buttonId + " presetname: " + currentPresetName.trim());
                      latest_preset_lang = "k-inv";
                      createChaosProgramButton(currentPresetName.trim(), latest_preset_lang);                      
                  } else {
                      // document.getElementById(buttonId).classList.remove('btn-light');
                      // document.getElementById(buttonId).classList.add('btn-light-saved');
                  }
              }
          } else {
              console.log("[GET-PRESETS] There is no saved presets in Redis");
          }
      }
  };;
  oReq.open("GET", k8s_url + "/chaos/loadpreset/savedpresets");
  oReq.send();
}

function loadSavedPreset(tool, lang, defaultpreset) {
  var oReq = new XMLHttpRequest();
  oReq.onreadystatechange = function () {
      if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
          if (this.responseText.trim() != "nil") {
              $("#currentLoadTest").val(this.responseText.trim());
          } else {
              $("#currentLoadTest").val(defaultpreset);
          }
      }
  };;
  oReq.open("GET", k8s_url + "/chaos/loadpreset?name=" + tool + "&lang=" + lang);
  oReq.send()
  var now = new Date().toLocaleString().replace(',','')
  $('#alert_placeholder_programming_mode').replaceWith(alert_div + '[' + now + '] Open preset for ' + tool + '</div>');
  //$('#alert_placeholder').replaceWith(alert_div + '[' + now + '] Open preset for ' + tool + '</div>');
}

function resetPreset(kind) {
  var oReq = new XMLHttpRequest();
  oReq.onreadystatechange = function () {
      if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
          let capitalizedPreset = latest_preset_name.charAt(0).toUpperCase() + latest_preset_name.slice(1);
          let buttonId = "load" + capitalizedPreset;
          // document.getElementById(buttonId).classList.remove('btn-light-saved');
          // document.getElementById(buttonId).classList.add('btn-light');
          closeSetLoadTestModal();
          getSavedPresets();
          if (kind == 'k-inv') {
              console.log("[DELETE-K-INV-PROGRAM] " + latest_preset_name + " deleted");
              deleteChaosProgramButton(latest_preset_name);
          }
          else {
              console.log("[RESET-PRESETS] " + latest_preset_name + " restored with default preset");
          }
          var now = new Date().toLocaleString().replace(',','')
          $('#alert_placeholder_programming_mode').replaceWith(alert_div + '[' + now + '] ' + latest_preset_name + ' preset has been restored with default code</div>');
          //$('#alert_placeholder').replaceWith(alert_div + '[' + now + '] ' + latest_preset_name + ' preset has been restored with default code</div>');
      }
  };;
  if (kind == 'k-inv') {
      console.log("[RESET-PRESETS] Deleting " + latest_preset_name + " lang " + latest_preset_lang);
  }
  oReq.open("POST", k8s_url + "/chaos/loadpreset/reset?name="+ latest_preset_name.toLowerCase() + "&lang="+ latest_preset_lang);
  oReq.send({});
}
