# Environment files

Secrets for `claritas-viz/claritas-viz.github.io` are **committed, encrypted**, with [sops] + [age],
following the fleet-wide `env/enc` + `env/dec` contract.

```
env/enc/dev.env.enc     ciphertext — committed. This is the source of truth.
env/enc/prod.env.enc    ciphertext — committed.
env/dec/dev.env         plaintext  — gitignored, mode 0600, disposable.
env/dec/prod.env        plaintext  — gitignored, mode 0600, disposable.
.env                    relative managed symlink -> env/dec/<name>.env
```

```sh
nix develop
just env-keygen
just env-whoami
just env-decrypt
just env-use dev
just env-check
```

`.just/env.just` and `.just/dotenv.py` are a shared module. Do not fork them.

[sops]: https://github.com/getsops/sops
[age]: https://github.com/FiloSottile/age
