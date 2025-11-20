from setuptools import find_packages, setup

setup(
    name="llm-framework",
    version="0.1.0",
    description="CLI and automation utilities for GitHub-driven agent workflows",
    author="Auto-generated",
    packages=find_packages(where="src"),
    package_dir={"": "src"},
    install_requires=[
        "requests>=2.31.0",
        "typer>=0.12.3",
        "PyYAML>=6.0.0",
        "tqdm>=4.66.0",
    ],
    extras_require={
        "dev": [
            "pytest>=7.4.0",
            "responses>=0.25.0",
        ]
    },
    entry_points={
        "console_scripts": [
            "llm-cli=llm_framework.scripts.cli:main",
        ],
    },
)
