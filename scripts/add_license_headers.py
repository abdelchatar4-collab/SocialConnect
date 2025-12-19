import os

HEADER_TEXT = """Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails."""

def get_commented_header(file_path):
    ext = os.path.splitext(file_path)[1]

    if ext in ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.css']:
        return "/*\n" + HEADER_TEXT + "\n*/\n\n"
    elif ext in ['.py', '.sh']:
        lines = HEADER_TEXT.split('\n')
        commented_lines = ["# " + line if line.strip() else "#" for line in lines]
        return "\n".join(commented_lines) + "\n\n"
    elif ext in ['.prisma']:
        lines = HEADER_TEXT.split('\n')
        commented_lines = ["// " + line if line.strip() else "//" for line in lines]
        return "\n".join(commented_lines) + "\n\n"
    return None

def add_header(file_path):
    header = get_commented_header(file_path)
    if not header:
        return

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        if "Copyright (C) 2025 ABDEL KADER CHATAR" in content:
            print(f"Skipping {file_path}, header already present.")
            return

        # Preserve shebang for shell scripts
        if file_path.endswith('.sh') and content.startswith('#!'):
            lines = content.split('\n')
            new_content = lines[0] + '\n\n' + header + '\n'.join(lines[1:])
        else:
            new_content = header + content

        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Added header to {file_path}")

    except Exception as e:
        print(f"Error processing {file_path}: {e}")

def main():
    base_dir = os.getcwd()
    target_dirs = ['src', 'scripts']
    target_files = ['deploy.sh', 'clean-docker.sh', 'commit-helper.sh', 'validate-refactoring.sh', 'setup.sh'] # Add known root scripts

    # Process target directories
    for d in target_dirs:
        path = os.path.join(base_dir, d)
        if not os.path.exists(path):
            continue
        for root, dirs, files in os.walk(path):
            if 'node_modules' in root or '.next' in root:
                continue
            for file in files:
                if file.endswith(('.ts', '.tsx', '.js', '.jsx', '.mjs', '.css', '.py', '.sh', '.prisma')):
                    add_header(os.path.join(root, file))

    # Process specific root files and others
    for root, dirs, files in os.walk(base_dir):
        # Skip hidden directories and dependencies
        if any(part.startswith('.') for part in root.split(os.sep)) and not root.endswith('.connector'): # naive check
             continue
        if 'node_modules' in root:
             continue

        for file in files:
            # We already did src and scripts recursively, so avoid re-doing them if we traverse from root.
            # But the logic above specifically targetted src and scripts.
            # Now let's just do a clean pass over everything and rely on "Skip if header present"

            # Actually, let's just stick to the plan: src, scripts, specific known root files + prisma
            pass

    # Explicitly looking for prisma
    prisma_path = os.path.join(base_dir, 'prisma', 'schema.prisma')
    if os.path.exists(prisma_path):
        add_header(prisma_path)

    # Walk everything for thoroughness but exclude git/node_modules
    for root, dirs, files in os.walk(base_dir):
        if '.git' in dirs: dirs.remove('.git')
        if 'node_modules' in dirs: dirs.remove('node_modules')
        if '.next' in dirs: dirs.remove('.next')
        if 'dist' in dirs: dirs.remove('dist')

        for file in files:
             if file.endswith(('.ts', '.tsx', '.js', '.jsx', '.mjs', '.css', '.py', '.sh')):
                 add_header(os.path.join(root, file))

if __name__ == "__main__":
    main()
