#!/bin/bash

# Script to set up GitHub Pages for the ParkHub Passes Creation Web Application
# This script automates the configuration of GitHub Pages hosting with multi-environment support
# Version: 1.0.0

# Color codes for output formatting
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Set script directory and config file path
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"
CONFIG_FILE="${SCRIPT_DIR}/../config/github-pages-config.json"

# Function to display script usage
function usage {
    echo "Setup GitHub Pages for ParkHub Passes Creation Web Application"
    echo
    echo "Usage: $0 [options]"
    echo
    echo "Options:"
    echo "  --repo <repository>      GitHub repository name (default: current git repository)"
    echo "  --user <username>        GitHub username or organization (default: extracted from git config)"
    echo "  --config <config_file>   Path to custom configuration file (default: ${CONFIG_FILE})"
    echo "  --help                   Display this help message"
    echo
    echo "Exit codes:"
    echo "  0: Success"
    echo "  1: Missing dependencies"
    echo "  2: Invalid arguments"
    echo "  3: Configuration error"
    echo "  4: Repository setup error"
    echo "  5: Branch creation error"
    echo "  6: GitHub Pages configuration error"
    echo "  7: Environment setup error"
    echo "  8: Custom domain setup error"
    echo "  9: Verification error"
    echo
}

# Function to check if required dependencies are installed
function check_dependencies {
    echo -e "${BLUE}Checking dependencies...${NC}"
    local missing_deps=0

    # Check if git is installed
    if ! command -v git &> /dev/null; then
        echo -e "${RED}Error: git is not installed. Please install git.${NC}"
        missing_deps=1
    fi

    # Check if GitHub CLI (gh) is installed
    if ! command -v gh &> /dev/null; then
        echo -e "${RED}Error: GitHub CLI (gh) is not installed. Please install gh: https://cli.github.com/manual/installation${NC}"
        missing_deps=1
    else
        # Check if gh is authenticated
        if ! gh auth status &> /dev/null; then
            echo -e "${RED}Error: GitHub CLI (gh) is not authenticated. Please run 'gh auth login'.${NC}"
            missing_deps=1
        fi
    fi

    # Check if jq is installed
    if ! command -v jq &> /dev/null; then
        echo -e "${RED}Error: jq is not installed. Please install jq: https://stedolan.github.io/jq/download/${NC}"
        missing_deps=1
    fi

    if [ $missing_deps -eq 1 ]; then
        return 1
    fi

    echo -e "${GREEN}All dependencies are installed.${NC}"
    return 0
}

# Function to parse command line arguments
function parse_arguments {
    # Default values
    REPO_NAME=""
    GITHUB_USERNAME=""

    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --repo)
                REPO_NAME="$2"
                shift 2
                ;;
            --user)
                GITHUB_USERNAME="$2"
                shift 2
                ;;
            --config)
                CONFIG_FILE="$2"
                shift 2
                ;;
            --help)
                usage
                exit 0
                ;;
            *)
                echo -e "${RED}Error: Unknown option $1${NC}" >&2
                usage
                return 2
                ;;
        esac
    done

    # If repo_name is not provided, try to extract it from git config
    if [ -z "$REPO_NAME" ]; then
        # Try to extract repository name from git remote URL
        local git_remote=$(git config --get remote.origin.url 2>/dev/null)
        if [ -n "$git_remote" ]; then
            # Extract repo name from git URL (works for both HTTPS and SSH URLs)
            REPO_NAME=$(basename -s .git "$git_remote" 2>/dev/null)
            echo -e "${YELLOW}Repository name not provided, using: ${REPO_NAME}${NC}"
        fi
    fi

    # If github_username is not provided, try to extract it from git config
    if [ -z "$GITHUB_USERNAME" ]; then
        # Try to extract username from git remote URL
        local git_remote=$(git config --get remote.origin.url 2>/dev/null)
        if [ -n "$git_remote" ]; then
            if [[ $git_remote == *"github.com"* ]]; then
                # Extract username from HTTPS URL
                if [[ $git_remote == https* ]]; then
                    GITHUB_USERNAME=$(echo "$git_remote" | sed -E 's|https://github.com/([^/]+)/.*|\1|')
                # Extract username from SSH URL
                elif [[ $git_remote == git@* ]]; then
                    GITHUB_USERNAME=$(echo "$git_remote" | sed -E 's|git@github.com:([^/]+)/.*|\1|')
                fi
                echo -e "${YELLOW}GitHub username not provided, using: ${GITHUB_USERNAME}${NC}"
            fi
        fi
    fi

    return 0
}

# Function to load configuration from the GitHub Pages config file
function load_configuration {
    echo -e "${BLUE}Loading configuration from ${CONFIG_FILE}...${NC}"

    # Check if configuration file exists
    if [ ! -f "$CONFIG_FILE" ]; then
        echo -e "${RED}Error: Configuration file not found: ${CONFIG_FILE}${NC}" >&2
        return 3
    fi

    # Check if the configuration file is valid JSON
    if ! jq -e . "$CONFIG_FILE" > /dev/null 2>&1; then
        echo -e "${RED}Error: Invalid JSON in configuration file: ${CONFIG_FILE}${NC}" >&2
        return 3
    fi

    # Extract repository information
    if jq -e '.repository' "$CONFIG_FILE" > /dev/null 2>&1; then
        local config_repo_name=$(jq -r '.repository.name' "$CONFIG_FILE")
        local config_repo_owner=$(jq -r '.repository.owner' "$CONFIG_FILE")
        
        # Use values from config if not already set
        if [ -z "$REPO_NAME" ]; then
            REPO_NAME="$config_repo_name"
            echo -e "${YELLOW}Using repository name from config: ${REPO_NAME}${NC}"
        elif [ "$REPO_NAME" != "$config_repo_name" ]; then
            echo -e "${YELLOW}Warning: Repository name in config (${config_repo_name}) does not match provided value (${REPO_NAME}).${NC}"
            echo -e "${YELLOW}Using provided value: ${REPO_NAME}${NC}"
        fi
        
        if [ -z "$GITHUB_USERNAME" ]; then
            GITHUB_USERNAME="$config_repo_owner"
            echo -e "${YELLOW}Using GitHub username from config: ${GITHUB_USERNAME}${NC}"
        elif [ "$GITHUB_USERNAME" != "$config_repo_owner" ]; then
            echo -e "${YELLOW}Warning: GitHub username in config (${config_repo_owner}) does not match provided value (${GITHUB_USERNAME}).${NC}"
            echo -e "${YELLOW}Using provided value: ${GITHUB_USERNAME}${NC}"
        fi
    fi

    # Extract branch information
    if jq -e '.branch' "$CONFIG_FILE" > /dev/null 2>&1; then
        BRANCH_NAME=$(jq -r '.branch' "$CONFIG_FILE")
    else
        BRANCH_NAME="gh-pages"
        echo -e "${YELLOW}Branch name not specified in config, using default: ${BRANCH_NAME}${NC}"
    fi

    # Extract environments information
    if jq -e '.environments' "$CONFIG_FILE" > /dev/null 2>&1; then
        ENVIRONMENTS=$(jq -c '.environments[]' "$CONFIG_FILE")
    else
        echo -e "${RED}Error: Environments not specified in configuration file.${NC}" >&2
        return 3
    fi

    # Extract custom domain settings
    if jq -e '.customDomain' "$CONFIG_FILE" > /dev/null 2>&1; then
        CUSTOM_DOMAIN_ENABLED=$(jq -r '.customDomain.enabled' "$CONFIG_FILE")
        if [ "$CUSTOM_DOMAIN_ENABLED" == "true" ]; then
            CUSTOM_DOMAIN_NAME=$(jq -r '.customDomain.name' "$CONFIG_FILE")
            echo -e "${YELLOW}Custom domain is enabled: ${CUSTOM_DOMAIN_NAME}${NC}"
        fi
    else
        CUSTOM_DOMAIN_ENABLED="false"
    fi

    # Validate required configuration values
    if [ -z "$REPO_NAME" ]; then
        echo -e "${RED}Error: Repository name is not specified.${NC}" >&2
        return 3
    fi

    if [ -z "$GITHUB_USERNAME" ]; then
        echo -e "${RED}Error: GitHub username is not specified.${NC}" >&2
        return 3
    fi

    echo -e "${GREEN}Configuration loaded successfully.${NC}"
    return 0
}

# Function to ensure the GitHub repository is properly configured
function setup_github_repository {
    echo -e "${BLUE}Setting up GitHub repository: ${GITHUB_USERNAME}/${REPO_NAME}...${NC}"

    # Check if repository exists
    if ! gh repo view "${GITHUB_USERNAME}/${REPO_NAME}" --json name &> /dev/null; then
        echo -e "${RED}Error: Repository ${GITHUB_USERNAME}/${REPO_NAME} does not exist or you don't have access to it.${NC}" >&2
        echo -e "${YELLOW}You need to create the repository first or check your permissions.${NC}" >&2
        return 4
    fi

    # Check if user has admin access to the repository (needed to configure GitHub Pages)
    local viewer_permission=$(gh repo view "${GITHUB_USERNAME}/${REPO_NAME}" --json viewerPermission --jq '.viewerPermission')
    
    if [ "$viewer_permission" != "ADMIN" ] && [ "$viewer_permission" != "WRITE" ]; then
        echo -e "${RED}Error: You need at least write access to repository ${GITHUB_USERNAME}/${REPO_NAME} to configure GitHub Pages.${NC}" >&2
        return 4
    fi

    echo -e "${GREEN}Repository access verified successfully.${NC}"
    return 0
}

# Function to create and configure the gh-pages branch
function create_gh_pages_branch {
    echo -e "${BLUE}Creating and configuring ${BRANCH_NAME} branch...${NC}"

    # Create temporary directory
    local temp_dir=$(mktemp -d)
    echo -e "  Using temporary directory: ${temp_dir}"

    # Check if branch exists
    if gh api repos/${GITHUB_USERNAME}/${REPO_NAME}/branches/${BRANCH_NAME} &> /dev/null; then
        echo -e "${YELLOW}Branch ${BRANCH_NAME} already exists.${NC}"
    else
        echo -e "  Creating orphan branch: ${BRANCH_NAME}"
        
        # Clone repository
        git clone https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git "${temp_dir}/repo" || {
            echo -e "${RED}Error: Failed to clone repository.${NC}" >&2
            rm -rf "${temp_dir}"
            return 5
        }
        
        cd "${temp_dir}/repo"
        
        # Create orphan branch
        git checkout --orphan ${BRANCH_NAME} || {
            echo -e "${RED}Error: Failed to create orphan branch.${NC}" >&2
            cd - > /dev/null
            rm -rf "${temp_dir}"
            return 5
        }
        
        # Remove all files
        git rm -rf . &> /dev/null
        
        # Create basic structure for environments
        mkdir -p dev staging
        
        # Create .nojekyll file to disable Jekyll processing
        touch .nojekyll
        
        # Create a basic index.html file for each environment
        echo "<html><body><h1>ParkHub Passes - Development Environment</h1><p>Setup successful!</p></body></html>" > dev/index.html
        echo "<html><body><h1>ParkHub Passes - Staging Environment</h1><p>Setup successful!</p></body></html>" > staging/index.html
        echo "<html><body><h1>ParkHub Passes - Production Environment</h1><p>Setup successful!</p></body></html>" > index.html
        
        # Add and commit files
        git add .
        git config user.name "GitHub Pages Setup"
        git config user.email "noreply@github.com"
        git commit -m "Initial ${BRANCH_NAME} branch setup with environment directories" || {
            echo -e "${RED}Error: Failed to commit files.${NC}" >&2
            cd - > /dev/null
            rm -rf "${temp_dir}"
            return 5
        }
        
        # Push branch to remote
        git push origin ${BRANCH_NAME} || {
            echo -e "${RED}Error: Failed to push branch.${NC}" >&2
            cd - > /dev/null
            rm -rf "${temp_dir}"
            return 5
        }
        
        cd - > /dev/null
    fi
    
    # Clean up
    rm -rf "${temp_dir}"
    
    echo -e "${GREEN}Branch ${BRANCH_NAME} configured successfully.${NC}"
    return 0
}

# Function to configure GitHub Pages settings in the repository
function configure_github_pages {
    echo -e "${BLUE}Configuring GitHub Pages settings...${NC}"
    
    # Check if GitHub Pages is already enabled
    local pages_info=$(gh api repos/${GITHUB_USERNAME}/${REPO_NAME}/pages 2>/dev/null || echo '{"html_url": "Not configured"}')
    local current_url=$(echo "$pages_info" | jq -r '.html_url // "Not configured"')
    
    if [ "$current_url" == "Not configured" ]; then
        echo -e "  Enabling GitHub Pages from ${BRANCH_NAME} branch..."
        
        # Enable GitHub Pages from the specified branch
        if ! gh api --method POST repos/${GITHUB_USERNAME}/${REPO_NAME}/pages \
            -f source="{\"branch\":\"${BRANCH_NAME}\", \"path\":\"/\"}" &> /dev/null; then
            echo -e "${RED}Error: Failed to enable GitHub Pages.${NC}" >&2
            return 6
        fi
    else
        echo -e "${YELLOW}GitHub Pages is already enabled for this repository.${NC}"
        echo -e "  Current URL: ${current_url}"
        
        # Update GitHub Pages source branch if it's different
        local current_branch=$(echo "$pages_info" | jq -r '.source.branch // "unknown"')
        
        if [ "$current_branch" != "$BRANCH_NAME" ]; then
            echo -e "  Updating GitHub Pages source branch from ${current_branch} to ${BRANCH_NAME}..."
            
            if ! gh api --method PUT repos/${GITHUB_USERNAME}/${REPO_NAME}/pages \
                -f source="{\"branch\":\"${BRANCH_NAME}\", \"path\":\"/\"}" &> /dev/null; then
                echo -e "${RED}Error: Failed to update GitHub Pages source branch.${NC}" >&2
                return 6
            fi
        fi
    fi
    
    # Enable HTTPS enforcement for better security
    echo -e "  Enabling HTTPS enforcement..."
    gh api --method PUT repos/${GITHUB_USERNAME}/${REPO_NAME}/pages \
        -f https_enforced=true &> /dev/null
    
    # Verify GitHub Pages settings
    local updated_pages_info=$(gh api repos/${GITHUB_USERNAME}/${REPO_NAME}/pages 2>/dev/null || echo '{"html_url": "Not configured"}')
    local updated_url=$(echo "$updated_pages_info" | jq -r '.html_url // "Not configured"')
    
    if [ "$updated_url" == "Not configured" ]; then
        echo -e "${RED}Error: Failed to verify GitHub Pages configuration.${NC}" >&2
        return 6
    fi
    
    echo -e "${GREEN}GitHub Pages configured successfully: ${updated_url}${NC}"
    return 0
}

# Function to set up GitHub environments for deployment
function setup_environments {
    echo -e "${BLUE}Setting up GitHub environments for deployment...${NC}"
    
    # Process each environment from the configuration
    echo "$ENVIRONMENTS" | while read -r env_config; do
        local env_name=$(echo "$env_config" | jq -r '.name')
        local env_path=$(echo "$env_config" | jq -r '.path')
        local env_url=$(echo "$env_config" | jq -r '.url')
        local required_reviewers=$(echo "$env_config" | jq -r '.protection.required_reviewers')
        local wait_timer=$(echo "$env_config" | jq -r '.protection.wait_timer')
        
        echo -e "  Setting up environment: ${env_name} (path: ${env_path}, url: ${env_url})"
        
        # Check if environment already exists
        if gh api repos/${GITHUB_USERNAME}/${REPO_NAME}/environments/${env_name} &> /dev/null; then
            echo -e "    Environment already exists, updating configuration..."
            
            # Update environment with protection rules if applicable
            if [ "$required_reviewers" -gt 0 ] || [ "$wait_timer" -gt 0 ]; then
                local deployment_branch_policy="{\"protected_branches\": true, \"custom_branch_policies\": false}"
                local reviewers_payload=""
                
                if [ "$required_reviewers" -gt 0 ]; then
                    reviewers_payload="\"required_reviewers\": $required_reviewers,"
                fi
                
                local wait_timer_payload=""
                if [ "$wait_timer" -gt 0 ]; then
                    wait_timer_payload="\"wait_timer\": $wait_timer,"
                fi
                
                local payload="{\"deployment_branch_policy\": $deployment_branch_policy, ${reviewers_payload} ${wait_timer_payload} \"url\": \"${env_url}\"}"
                
                if ! gh api --method PUT repos/${GITHUB_USERNAME}/${REPO_NAME}/environments/${env_name} -f deployment_branch_policy="${deployment_branch_policy}" &> /dev/null; then
                    echo -e "${YELLOW}Warning: Failed to update environment protection rules.${NC}"
                fi
            fi
        else
            echo -e "    Creating new environment..."
            
            # Create environment with protection rules if applicable
            local deployment_branch_policy="{\"protected_branches\": true, \"custom_branch_policies\": false}"
            local reviewers_payload=""
            
            if [ "$required_reviewers" -gt 0 ]; then
                reviewers_payload="\"required_reviewers\": $required_reviewers,"
            fi
            
            local wait_timer_payload=""
            if [ "$wait_timer" -gt 0 ]; then
                wait_timer_payload="\"wait_timer\": $wait_timer,"
            fi
            
            local payload="{\"deployment_branch_policy\": $deployment_branch_policy, ${reviewers_payload} ${wait_timer_payload} \"url\": \"${env_url}\"}"
            
            if ! gh api --method PUT repos/${GITHUB_USERNAME}/${REPO_NAME}/environments/${env_name} \
                --silent &> /dev/null; then
                echo -e "${YELLOW}Warning: Failed to create environment.${NC}"
            fi
            
            # Add protection rules if applicable
            if [ "$required_reviewers" -gt 0 ] || [ "$wait_timer" -gt 0 ]; then
                if ! gh api --method PUT repos/${GITHUB_USERNAME}/${REPO_NAME}/environments/${env_name} \
                    -f deployment_branch_policy="${deployment_branch_policy}" &> /dev/null; then
                    echo -e "${YELLOW}Warning: Failed to set environment protection rules.${NC}"
                fi
            fi
        fi
        
        # Set environment variables
        if echo "$env_config" | jq -e '.variables' > /dev/null; then
            echo -e "    Setting environment variables..."
            
            echo "$env_config" | jq -r '.variables | to_entries[] | [.key, .value] | @tsv' | while IFS=$'\t' read -r key value; do
                if ! gh variable set "$key" -b "$value" --env "$env_name" --repo "${GITHUB_USERNAME}/${REPO_NAME}" &> /dev/null; then
                    echo -e "${YELLOW}Warning: Failed to set environment variable: ${key}${NC}"
                else
                    echo -e "      Set variable: ${key}"
                fi
            done
        fi
    done
    
    echo -e "${GREEN}Environments set up successfully.${NC}"
    return 0
}

# Function to set up custom domain if enabled in configuration
function setup_custom_domain {
    if [ "$CUSTOM_DOMAIN_ENABLED" != "true" ]; then
        echo -e "${YELLOW}Custom domain is not enabled in configuration, skipping setup.${NC}"
        return 0
    fi
    
    echo -e "${BLUE}Setting up custom domain: ${CUSTOM_DOMAIN_NAME}...${NC}"
    
    # Call the configure-custom-domain.sh script with necessary parameters
    if [ -f "${SCRIPT_DIR}/configure-custom-domain.sh" ]; then
        echo -e "  Calling configure-custom-domain.sh script..."
        
        # Make the script executable if it's not already
        chmod +x "${SCRIPT_DIR}/configure-custom-domain.sh"
        
        # Execute the script
        "${SCRIPT_DIR}/configure-custom-domain.sh" --repo "$REPO_NAME" --user "$GITHUB_USERNAME" --config "$CONFIG_FILE" "$CUSTOM_DOMAIN_NAME"
        local result=$?
        
        if [ $result -ne 0 ]; then
            echo -e "${RED}Error: Custom domain setup failed with exit code ${result}.${NC}" >&2
            return 8
        fi
    else
        echo -e "${RED}Error: Custom domain setup script not found: ${SCRIPT_DIR}/configure-custom-domain.sh${NC}" >&2
        echo -e "${YELLOW}You will need to configure the custom domain manually.${NC}"
        echo -e "${YELLOW}1. Go to repository settings > Pages${NC}"
        echo -e "${YELLOW}2. Enter ${CUSTOM_DOMAIN_NAME} in the Custom domain field${NC}"
        echo -e "${YELLOW}3. Follow the instructions to configure DNS settings${NC}"
        return 8
    fi
    
    echo -e "${GREEN}Custom domain set up successfully.${NC}"
    return 0
}

# Function to verify that GitHub Pages is properly set up
function verify_setup {
    echo -e "${BLUE}Verifying GitHub Pages setup...${NC}"
    
    # Check if GitHub Pages is enabled
    local pages_info=$(gh api repos/${GITHUB_USERNAME}/${REPO_NAME}/pages 2>/dev/null || echo '{"html_url": "Not configured"}')
    local pages_url=$(echo "$pages_info" | jq -r '.html_url // "Not configured"')
    
    if [ "$pages_url" == "Not configured" ]; then
        echo -e "${RED}Error: GitHub Pages is not enabled for this repository.${NC}" >&2
        return 9
    fi
    
    echo -e "  GitHub Pages URL: ${pages_url}"
    
    # Check if branch exists
    if ! gh api repos/${GITHUB_USERNAME}/${REPO_NAME}/branches/${BRANCH_NAME} &> /dev/null; then
        echo -e "${RED}Error: Branch ${BRANCH_NAME} does not exist.${NC}" >&2
        return 9
    fi
    
    echo -e "  Branch ${BRANCH_NAME} exists."
    
    # Check if HTTPS is enforced
    local https_enforced=$(echo "$pages_info" | jq -r '.https_enforced // false')
    if [ "$https_enforced" == "true" ]; then
        echo -e "  HTTPS enforcement is enabled."
    else
        echo -e "${YELLOW}Warning: HTTPS enforcement is not enabled.${NC}"
        echo -e "${YELLOW}This might take some time to be enabled by GitHub.${NC}"
    fi
    
    # Check if custom domain is configured (if enabled)
    if [ "$CUSTOM_DOMAIN_ENABLED" == "true" ]; then
        local custom_domain=$(echo "$pages_info" | jq -r '.custom_domain // "Not set"')
        if [ "$custom_domain" == "$CUSTOM_DOMAIN_NAME" ]; then
            echo -e "  Custom domain is configured: ${custom_domain}"
        else
            echo -e "${YELLOW}Warning: Custom domain is not correctly configured.${NC}"
            echo -e "${YELLOW}Expected: ${CUSTOM_DOMAIN_NAME}, Actual: ${custom_domain:-Not set}${NC}"
        fi
    fi
    
    echo -e "${GREEN}GitHub Pages setup verified successfully.${NC}"
    return 0
}

# Function to display a summary of the GitHub Pages setup
function display_setup_summary {
    echo -e "\n${BLUE}GitHub Pages Setup Summary${NC}"
    echo -e "=============================="
    echo -e "Repository:       ${GITHUB_USERNAME}/${REPO_NAME}"
    echo -e "Branch:           ${BRANCH_NAME}"
    
    # Get GitHub Pages URL
    local pages_info=$(gh api repos/${GITHUB_USERNAME}/${REPO_NAME}/pages 2>/dev/null || echo '{"html_url": "Not configured"}')
    local pages_url=$(echo "$pages_info" | jq -r '.html_url // "Not configured"')
    echo -e "GitHub Pages URL: ${pages_url}"
    
    # Display environments
    echo -e "\nEnvironments:"
    echo "$ENVIRONMENTS" | while read -r env_config; do
        local env_name=$(echo "$env_config" | jq -r '.name')
        local env_path=$(echo "$env_config" | jq -r '.path')
        local env_url=$(echo "$env_config" | jq -r '.url')
        
        echo -e "  - ${env_name}"
        echo -e "    Path: ${env_path}"
        echo -e "    URL:  ${env_url}"
    done
    
    # Display custom domain information if enabled
    if [ "$CUSTOM_DOMAIN_ENABLED" == "true" ]; then
        echo -e "\nCustom Domain:"
        echo -e "  Name:         ${CUSTOM_DOMAIN_NAME}"
        echo -e "  HTTPS:        Enforced"
    fi
    
    echo -e "\n${YELLOW}Next Steps:${NC}"
    echo -e "1. Configure GitHub Actions workflow to deploy to the environments"
    echo -e "2. Push your code to trigger the deployment"
    if [ "$CUSTOM_DOMAIN_ENABLED" == "true" ]; then
        echo -e "3. Verify your custom domain DNS settings"
    fi
    echo -e "=============================="
}

# Main function
function main {
    # Display banner
    echo -e "\n${BLUE}=======================================================================${NC}"
    echo -e "${BLUE}      ParkHub Passes Creation Web Application - GitHub Pages Setup      ${NC}"
    echo -e "${BLUE}=======================================================================${NC}\n"
    
    # Check dependencies
    check_dependencies
    if [ $? -ne 0 ]; then
        exit 1
    fi
    
    # Parse arguments
    parse_arguments "$@"
    if [ $? -ne 0 ]; then
        exit 2
    fi
    
    # Load configuration
    load_configuration
    if [ $? -ne 0 ]; then
        exit 3
    fi
    
    # Setup GitHub repository
    setup_github_repository
    if [ $? -ne 0 ]; then
        exit 4
    fi
    
    # Create and configure gh-pages branch
    create_gh_pages_branch
    if [ $? -ne 0 ]; then
        exit 5
    fi
    
    # Configure GitHub Pages
    configure_github_pages
    if [ $? -ne 0 ]; then
        exit 6
    fi
    
    # Setup environments
    setup_environments
    if [ $? -ne 0 ]; then
        exit 7
    fi
    
    # Setup custom domain if enabled
    if [ "$CUSTOM_DOMAIN_ENABLED" == "true" ]; then
        setup_custom_domain
        if [ $? -ne 0 ]; then
            exit 8
        fi
    fi
    
    # Verify setup
    verify_setup
    if [ $? -ne 0 ]; then
        exit 9
    fi
    
    # Display setup summary
    display_setup_summary
    
    echo -e "\n${GREEN}GitHub Pages setup completed successfully!${NC}"
    echo -e "${GREEN}Your ParkHub Passes Creation Web Application is now ready for deployment.${NC}\n"
    
    return 0
}

# Execute main function with all arguments
main "$@"